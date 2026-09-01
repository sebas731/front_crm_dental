"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { mensajeError } from "@/lib/apiError";
import { ESTADO_ATENCION } from "@/lib/estados";
import { atenderCita } from "@/services/citas";
import type {
  AtencionInput,
  Cita,
  EstadoAtencion,
  Medico,
  ServicioDental,
} from "@/types";

export function AtencionForm({
  cita,
  medicos,
  servicios,
  onSaved,
}: {
  cita: Cita;
  medicos: Medico[];
  servicios: ServicioDental[];
  onSaved: (cita: Cita) => void;
}) {
  const medicoNombre = (() => {
    const m = medicos.find((x) => x.id === cita.medico);
    return m ? `${m.nombres} ${m.apellidos}` : "—";
  })();
  const servicioNombre =
    servicios.find((s) => s.id === cita.servicio)?.nombre ?? "—";
  const [form, setForm] = useState<AtencionInput>({
    estado: cita.atencion?.estado ?? "ATENDIDO",
    medico_atendio: cita.atencion?.medico_atendio ?? cita.medico,
    descripcion: cita.atencion?.descripcion ?? "",
    evolucion: cita.atencion?.evolucion ?? "",
    firma: cita.atencion?.firma ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof AtencionInput>(k: K, v: AtencionInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const updated = await atenderCita(cita.id, form);
      onSaved(updated);
    } catch (err) {
      setError(mensajeError(err, "No se pudo registrar la atención."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Contexto de la cita: doctor y servicio */}
      <div className="grid gap-2 rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-sm sm:grid-cols-2">
        <div>
          <span className="text-slate-400">Doctor</span>
          <p className="font-medium text-slate-700">{medicoNombre}</p>
        </div>
        <div>
          <span className="text-slate-400">Servicio</span>
          <p className="font-medium text-slate-700">{servicioNombre}</p>
        </div>
      </div>

      <Select
        label="Estado de atención"
        value={form.estado ?? "ATENDIDO"}
        onChange={(e) => set("estado", e.target.value as EstadoAtencion)}
      >
        {Object.entries(ESTADO_ATENCION).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </Select>
      <Select
        label="Médico que atendió"
        value={form.medico_atendio ?? cita.medico}
        onChange={(e) => set("medico_atendio", e.target.value)}
      >
        {medicos.map((m) => (
          <option key={m.id} value={m.id}>
            {m.nombres} {m.apellidos}
          </option>
        ))}
      </Select>
      <Textarea
        label="Descripción de la cita"
        rows={2}
        value={form.descripcion ?? ""}
        onChange={(e) => set("descripcion", e.target.value)}
      />
      <Textarea
        label="Evolución del tratamiento"
        rows={2}
        value={form.evolucion ?? ""}
        onChange={(e) => set("evolucion", e.target.value)}
      />
      <Input
        label="Firma (texto)"
        placeholder="Firma del profesional"
        value={form.firma ?? ""}
        onChange={(e) => set("firma", e.target.value)}
      />
      {error && <p className="text-danger text-sm">{error}</p>}
      <Button type="submit" disabled={saving}>
        {saving
          ? "Guardando…"
          : cita.atencion
            ? "Actualizar atención"
            : "Registrar atención"}
      </Button>
    </form>
  );
}
