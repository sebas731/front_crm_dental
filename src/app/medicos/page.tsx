"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { mensajeError } from "@/lib/apiError";
import {
  createMedico,
  deleteMedico,
  listMedicos,
  updateMedico,
} from "@/services/citas";
import type { Medico, MedicoInput } from "@/types";

const EMPTY: MedicoInput = {
  nombres: "",
  apellidos: "",
  especialidad: "",
  colegiatura: "",
  telefono: "",
  correo: "",
  activo: true,
};

export default function MedicosPage() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<MedicoInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    listMedicos()
      .then((r) => {
        if (!active) return;
        setMedicos(r.results);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function reload() {
    setMedicos((await listMedicos()).results);
  }

  function set<K extends keyof MedicoInput>(k: K, v: MedicoInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createMedico(form);
      setForm(EMPTY);
      setShowForm(false);
      await reload();
    } catch (err) {
      setError(mensajeError(err, "No se pudo registrar el médico."));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActivo(m: Medico) {
    await updateMedico(m.id, { activo: !m.activo });
    await reload();
  }

  async function handleDelete(m: Medico) {
    if (!confirm(`¿Eliminar al Dr(a). ${m.nombres} ${m.apellidos}?`)) return;
    await deleteMedico(m.id);
    await reload();
  }

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
            Médicos
          </h1>
          <p className="text-sm text-slate-500">Doctores de la clínica</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "Nuevo médico"}
        </Button>
      </div>

      {showForm && (
        <Card title="Registrar médico" className="mb-6">
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Nombres"
              value={form.nombres}
              onChange={(e) => set("nombres", e.target.value)}
              required
            />
            <Input
              label="Apellidos"
              value={form.apellidos}
              onChange={(e) => set("apellidos", e.target.value)}
              required
            />
            <Input
              label="Especialidad"
              value={form.especialidad ?? ""}
              onChange={(e) => set("especialidad", e.target.value)}
            />
            <Input
              label="Colegiatura (CMP/COP)"
              value={form.colegiatura ?? ""}
              onChange={(e) => set("colegiatura", e.target.value)}
            />
            <Input
              label="Teléfono"
              value={form.telefono ?? ""}
              onChange={(e) => set("telefono", e.target.value)}
            />
            <Input
              label="Correo"
              type="email"
              value={form.correo ?? ""}
              onChange={(e) => set("correo", e.target.value)}
            />

            {error && (
              <p className="text-sm text-rose-500 sm:col-span-2">{error}</p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando…" : "Registrar médico"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">Especialidad</th>
              <th className="px-4 py-2 font-medium">Colegiatura</th>
              <th className="px-4 py-2 font-medium">Contacto</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={6}>
                  Cargando…
                </td>
              </tr>
            ) : medicos.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={6}>
                  Sin médicos registrados.
                </td>
              </tr>
            ) : (
              medicos.map((m) => (
                <tr key={m.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-800">
                    {m.nombres} {m.apellidos}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {m.especialidad || "—"}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {m.colegiatura || "—"}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {m.telefono || m.correo || "—"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleActivo(m)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.activo
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {m.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="danger"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => handleDelete(m)}
                    >
                      Eliminar
                    </Button>
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
