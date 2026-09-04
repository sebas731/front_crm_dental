"use client";

import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { CitaCardList } from "@/components/citas/CitaCardList";
import { CitasFilterBar } from "@/components/citas/CitasFilterBar";
import { PeriodoTabs } from "@/components/citas/PeriodoTabs";
import { HoraAmPm } from "@/components/ui/HoraAmPm";
import { WhatsAppButton } from "@/components/citas/WhatsAppButton";
import { ServicioSelect } from "@/components/servicios/ServicioSelect";
import { useAuth } from "@/context/AuthContext";
import { ESTADO_CITA } from "@/lib/estados";
import {
  FILTROS_VACIOS,
  filterCitas,
  periodoDeRango,
  rangoDePeriodo,
  type CitaFiltros,
  type PeriodoRango,
} from "@/lib/filtros";
import { esMedico, puedeCrearCitas } from "@/lib/roles";
import { mensajeError } from "@/lib/apiError";
import {
  createCita,
  listCitas,
  listMedicos,
  listServicios,
} from "@/services/citas";
import { listPacientes } from "@/services/pacientes";
import type {
  Cita,
  CitaInput,
  EstadoCita,
  Medico,
  Paciente,
  ServicioDental,
} from "@/types";

const ESTADOS: Record<EstadoCita, string> = {
  PROGRAMADA: "Programada",
  CONFIRMADA: "Confirmada",
  EN_ATENCION: "En atención",
  ATENDIDA: "Atendida",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistió",
};

const EMPTY: CitaInput = {
  paciente: "",
  medico: "",
  servicio: "",
  fecha: "",
  hora_inicio: "",
  estado: "PROGRAMADA",
  motivo: "",
};

export default function CitasPage() {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [servicios, setServicios] = useState<ServicioDental[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CitaInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Por defecto abre en "Esta semana" para no acumular todas las citas.
  const [filtros, setFiltros] = useState<CitaFiltros>(() => ({
    ...FILTROS_VACIOS,
    ...rangoDePeriodo("semana"),
  }));
  const [vista, setVista] = useState<"tabla" | "tarjetas">("tabla");

  const periodoActivo = periodoDeRango(filtros);

  function seleccionarPeriodo(p: PeriodoRango) {
    setFiltros((f) => ({ ...f, ...rangoDePeriodo(p) }));
  }

  async function load() {
    const [c, p, m, s] = await Promise.all([
      listCitas(),
      listPacientes(),
      listMedicos(),
      listServicios(),
    ]);
    setCitas(c.results);
    setPacientes(p.results);
    setMedicos(m.results);
    setServicios(s.results);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    Promise.all([listCitas(), listPacientes(), listMedicos(), listServicios()])
      .then(([c, p, m, s]) => {
        if (!active) return;
        setCitas(c.results);
        setPacientes(p.results);
        setMedicos(m.results);
        setServicios(s.results);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const pacienteName = (id: string) => {
    const p = pacientes.find((x) => x.id === id);
    return p ? `${p.nombres} ${p.apellido_paterno}` : id;
  };
  const medicoName = (id: string) => {
    const m = medicos.find((x) => x.id === id);
    return m ? `${m.nombres} ${m.apellidos}` : id;
  };
  const servicioName = (id: string | null) => {
    const s = servicios.find((x) => x.id === id);
    return s ? s.nombre : "—";
  };

  // El médico solo ve sus propias citas.
  const miMedicoId = esMedico(user)
    ? (medicos.find((m) => m.usuario === user?.id)?.id ?? "__ninguno__")
    : null;

  const filtradas = useMemo(() => {
    const base = miMedicoId
      ? citas.filter((c) => c.medico === miMedicoId)
      : citas;
    return filterCitas(base, filtros);
  }, [citas, filtros, miMedicoId]);

  function update<K extends keyof CitaInput>(key: K, value: CitaInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createCita({ ...form, servicio: form.servicio || null });
      setForm(EMPTY); // limpia el formulario tras registrar
      setShowForm(false);
      await load();
    } catch (err) {
      setError(mensajeError(err, "No se pudo crear la cita."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
          Citas ({filtradas.length})
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setVista("tabla")}
              className={`rounded-lg p-1.5 ${vista === "tabla" ? "bg-teal-50 text-teal-600" : "text-slate-400"}`}
              aria-label="Vista tabla"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setVista("tarjetas")}
              className={`rounded-lg p-1.5 ${vista === "tarjetas" ? "bg-teal-50 text-teal-600" : "text-slate-400"}`}
              aria-label="Vista tarjetas"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          {puedeCrearCitas(user) && (
            <Button
              onClick={() => setShowForm((v) => !v)}
              disabled={pacientes.length === 0 || medicos.length === 0}
            >
              {showForm ? "Cancelar" : "Nueva cita"}
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 grid gap-3 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:grid-cols-2"
        >
          <Select
            label="Paciente"
            value={form.paciente ?? ""}
            onChange={(e) => update("paciente", e.target.value)}
            required
          >
            <option value="">Seleccionar…</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombres} {p.apellido_paterno}
              </option>
            ))}
          </Select>
          <Select
            label="Médico"
            value={form.medico ?? ""}
            onChange={(e) => update("medico", e.target.value)}
            required
          >
            <option value="">Seleccionar…</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombres} {m.apellidos}
              </option>
            ))}
          </Select>
          <ServicioSelect
            label="Servicio (opcional)"
            servicios={servicios}
            value={form.servicio ?? ""}
            onChange={(v) => update("servicio", v)}
            placeholder="—"
          />
          <Select
            label="Estado"
            value={form.estado ?? "PROGRAMADA"}
            onChange={(e) => update("estado", e.target.value as EstadoCita)}
          >
            {Object.entries(ESTADOS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Input
            label="Fecha"
            type="date"
            value={form.fecha ?? ""}
            onChange={(e) => update("fecha", e.target.value)}
            required
          />
          <HoraAmPm
            label="Hora"
            value={form.hora_inicio ?? ""}
            onChange={(v) => update("hora_inicio", v)}
            required
          />
          <Input
            label="Motivo"
            className="sm:col-span-2"
            value={form.motivo ?? ""}
            onChange={(e) => update("motivo", e.target.value)}
          />
          {error && (
            <p className="text-sm text-rose-500 sm:col-span-2">{error}</p>
          )}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar cita"}
            </Button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <PeriodoTabs activo={periodoActivo} onSelect={seleccionarPeriodo} />
      </div>

      <CitasFilterBar
        filtros={filtros}
        onChange={setFiltros}
        pacientes={pacientes}
        servicios={servicios}
      />

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : vista === "tarjetas" ? (
        <CitaCardList
          citas={filtradas}
          pacientes={pacientes}
          medicoName={medicoName}
          servicioName={servicioName}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Fecha</th>
                <th className="px-4 py-2 font-medium">Hora</th>
                <th className="px-4 py-2 font-medium">Paciente</th>
                <th className="px-4 py-2 font-medium">Médico</th>
                <th className="px-4 py-2 font-medium">Servicio</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={7}>
                    Sin citas.
                  </td>
                </tr>
              ) : (
                filtradas.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{c.fecha}</td>
                    <td className="px-4 py-2">{c.hora_inicio.slice(0, 5)}</td>
                    <td className="px-4 py-2">{pacienteName(c.paciente)}</td>
                    <td className="px-4 py-2">{medicoName(c.medico)}</td>
                    <td className="px-4 py-2">{servicioName(c.servicio)}</td>
                    <td className="px-4 py-2">
                      <Badge
                        label={ESTADO_CITA[c.estado].label}
                        color={ESTADO_CITA[c.estado].color}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-3">
                        <WhatsAppButton
                          cita={c}
                          paciente={pacientes.find((p) => p.id === c.paciente)}
                        />
                        <Link
                          href={`/citas/${c.id}`}
                          className="text-sm font-medium text-teal-600 hover:underline"
                        >
                          Ver / Atender
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
