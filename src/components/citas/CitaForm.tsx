"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { HoraAmPm } from "@/components/ui/HoraAmPm";
import { ServicioSelect } from "@/components/servicios/ServicioSelect";
import { mensajeError } from "@/lib/apiError";
import { createCita } from "@/services/citas";
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

export function CitaForm({
  pacientes,
  medicos,
  servicios,
  onCreated,
}: {
  pacientes: Paciente[];
  medicos: Medico[];
  servicios: ServicioDental[];
  onCreated: (cita: Cita) => void | Promise<void>;
}) {
  const [form, setForm] = useState<CitaInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof CitaInput>(key: K, value: CitaInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const cita = await createCita({ ...form, servicio: form.servicio || null });
      setForm(EMPTY);
      await onCreated(cita);
    } catch (err) {
      setError(mensajeError(err, "No se pudo crear la cita."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
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
      {error && <p className="text-sm text-rose-500 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar cita"}
        </Button>
      </div>
    </form>
  );
}
