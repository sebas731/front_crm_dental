"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { mensajeError } from "@/lib/apiError";
import { PROCEDENCIA } from "@/lib/procedencia";
import { esAdministrativo, puedeRegistrarPacientes } from "@/lib/roles";
import {
  createPaciente,
  deletePaciente,
  listPacientes,
} from "@/services/pacientes";
import type { Paciente, PacienteInput } from "@/types";

const EMPTY: PacienteInput = {
  nombres: "",
  apellido_paterno: "",
  apellido_materno: "",
  sexo: "M",
  tipo_documento: "DNI",
  numero_documento: "",
  telefono: "",
  correo: "",
  procedencia: "",
};

export default function PacientesPage() {
  const { user } = useAuth();
  const puedeGestionar = puedeRegistrarPacientes(user);
  const puedeEliminar = esAdministrativo(user); // borrar: solo administrativos
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PacienteInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetches without a synchronous setState (safe to call from an effect).
  const load = useCallback(async (searchTerm: string) => {
    const res = await listPacientes({ search: searchTerm || undefined });
    setPacientes(res.results);
    setCount(res.count);
    setLoading(false);
  }, []);

  // Reload triggered by user actions (shows the loading state first).
  const reload = useCallback(
    async (searchTerm: string) => {
      setLoading(true);
      await load(searchTerm);
    },
    [load],
  );

  useEffect(() => {
    let active = true;
    listPacientes()
      .then((res) => {
        if (!active) return;
        setPacientes(res.results);
        setCount(res.count);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof PacienteInput>(
    key: K,
    value: PacienteInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      // Mapea nombres/apellidos también a los campos heredados de Cliente.
      await createPaciente({
        ...form,
        nombre: form.nombres,
        apellido: form.apellido_paterno,
      });
      setForm(EMPTY);
      setShowForm(false);
      await reload(search);
    } catch (err) {
      setError(mensajeError(err, "No se pudo crear el paciente."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este paciente?")) return;
    try {
      await deletePaciente(id);
      await reload(search);
    } catch (err) {
      // El backend protege pacientes con citas/ventas/historia (400).
      alert(mensajeError(err, "No se pudo eliminar el paciente."));
    }
  }

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pacientes ({count})</h1>
        {puedeGestionar && (
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancelar" : "Nuevo paciente"}
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 grid gap-3 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:grid-cols-2"
        >
          <Input
            label="Nombres"
            value={form.nombres ?? ""}
            onChange={(e) => update("nombres", e.target.value)}
            required
          />
          <Input
            label="Apellido paterno"
            value={form.apellido_paterno ?? ""}
            onChange={(e) => update("apellido_paterno", e.target.value)}
            required
          />
          <Input
            label="Apellido materno"
            value={form.apellido_materno ?? ""}
            onChange={(e) => update("apellido_materno", e.target.value)}
          />
          <Select
            label="Sexo"
            value={form.sexo ?? "M"}
            onChange={(e) =>
              update("sexo", e.target.value as PacienteInput["sexo"])
            }
          >
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </Select>
          <Select
            label="Tipo de documento"
            value={form.tipo_documento ?? "DNI"}
            onChange={(e) =>
              update(
                "tipo_documento",
                e.target.value as PacienteInput["tipo_documento"],
              )
            }
          >
            <option value="DNI">DNI</option>
            <option value="CE">Carné de extranjería</option>
            <option value="PAS">Pasaporte</option>
            <option value="PART">Partida de nacimiento</option>
          </Select>
          <Input
            label="N.º de documento"
            value={form.numero_documento ?? ""}
            onChange={(e) => update("numero_documento", e.target.value)}
            required
          />
          <Input
            label="Teléfono"
            value={form.telefono ?? ""}
            onChange={(e) => update("telefono", e.target.value)}
          />
          <Input
            label="Correo"
            type="email"
            value={form.correo ?? ""}
            onChange={(e) => update("correo", e.target.value)}
          />
          <Select
            label="¿De dónde viene el paciente?"
            value={form.procedencia ?? ""}
            onChange={(e) =>
              update(
                "procedencia",
                e.target.value as PacienteInput["procedencia"],
              )
            }
          >
            <option value="">Sin especificar</option>
            {Object.entries(PROCEDENCIA).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>

          {error && (
            <p className="text-sm text-rose-500 sm:col-span-2">{error}</p>
          )}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar paciente"}
            </Button>
          </div>
        </form>
      )}

      <div className="mb-3">
        <Input
          label="Buscar paciente (nombre o DNI)"
          placeholder="Escribí un nombre o número de DNI y Enter…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") reload(search);
          }}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Documento</th>
              <th className="px-4 py-2">Teléfono</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="text-muted px-4 py-4" colSpan={4}>
                  Cargando…
                </td>
              </tr>
            ) : pacientes.length === 0 ? (
              <tr>
                <td className="text-muted px-4 py-4" colSpan={4}>
                  Sin resultados.
                </td>
              </tr>
            ) : (
              pacientes.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">
                    <Link
                      href={`/pacientes/${p.id}`}
                      className="font-medium text-slate-800 hover:text-teal-700 hover:underline"
                    >
                      {p.nombres} {p.apellido_paterno} {p.apellido_materno}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    {p.tipo_documento} {p.numero_documento}
                  </td>
                  <td className="px-4 py-2">{p.telefono || "—"}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/pacientes/${p.id}`}
                        className="text-sm text-teal-600 hover:underline"
                      >
                        Ver ficha
                      </Link>
                      {puedeEliminar && (
                        <Button
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => handleDelete(p.id)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
