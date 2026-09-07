"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { mensajeError } from "@/lib/apiError";
import { edadDesde } from "@/lib/fechas";
import { PROCEDENCIA } from "@/lib/procedencia";
import type { Paciente, PacienteInput } from "@/types";

const GRUPOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function initFrom(p?: Paciente | null): PacienteInput {
  return {
    nombres: p?.nombres ?? "",
    apellido_paterno: p?.apellido_paterno ?? "",
    apellido_materno: p?.apellido_materno ?? "",
    sexo: p?.sexo ?? "M",
    edad: p?.edad ?? null,
    fecha_nacimiento: p?.fecha_nacimiento ?? "",
    tipo_documento: p?.tipo_documento ?? "DNI",
    numero_documento: p?.numero_documento ?? "",
    grupo_sanguineo: p?.grupo_sanguineo ?? "",
    procedencia: p?.procedencia ?? "",
    centro_educativo: p?.centro_educativo ?? "",
    nombre_padre: p?.nombre_padre ?? "",
    nombre_madre: p?.nombre_madre ?? "",
    direccion: p?.direccion ?? "",
    telefono: p?.telefono ?? "",
    whatsapp: p?.whatsapp ?? "",
    correo: p?.correo ?? "",
  };
}

export function PacienteForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: Paciente | null;
  onSubmit: (data: PacienteInput) => Promise<void>;
  submitLabel: string;
}) {
  const [form, setForm] = useState<PacienteInput>(() => initFrom(initial));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof PacienteInput>(k: K, v: PacienteInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        // Fecha vacía → null (el DateField no acepta "").
        fecha_nacimiento: form.fecha_nacimiento || null,
        // Mantiene sincronizados los campos heredados de Cliente.
        nombre: form.nombres,
        apellido: form.apellido_paterno,
      });
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <Input
        label="Nombres"
        value={form.nombres ?? ""}
        onChange={(e) => set("nombres", e.target.value)}
        required
      />
      <Input
        label="Apellido paterno"
        value={form.apellido_paterno ?? ""}
        onChange={(e) => set("apellido_paterno", e.target.value)}
        required
      />
      <Input
        label="Apellido materno"
        value={form.apellido_materno ?? ""}
        onChange={(e) => set("apellido_materno", e.target.value)}
      />
      <Select
        label="Sexo"
        value={form.sexo ?? "M"}
        onChange={(e) => set("sexo", e.target.value as PacienteInput["sexo"])}
      >
        <option value="M">Masculino</option>
        <option value="F">Femenino</option>
      </Select>
      <Select
        label="Tipo de documento"
        value={form.tipo_documento ?? "DNI"}
        onChange={(e) =>
          set(
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
        onChange={(e) => set("numero_documento", e.target.value)}
        required
      />
      <Input
        label={form.fecha_nacimiento ? "Edad (según fecha)" : "Edad"}
        type="number"
        min="0"
        value={form.edad ?? ""}
        readOnly={!!form.fecha_nacimiento}
        onChange={(e) =>
          set("edad", e.target.value === "" ? null : Number(e.target.value))
        }
      />
      <Input
        label="Fecha de nacimiento"
        type="date"
        value={form.fecha_nacimiento ?? ""}
        onChange={(e) =>
          // Al fijar la fecha, la edad se deriva automáticamente (así no
          // quedan desincronizadas).
          setForm((f) => ({
            ...f,
            fecha_nacimiento: e.target.value,
            edad: edadDesde(e.target.value) ?? f.edad,
          }))
        }
      />
      <Select
        label="Grupo sanguíneo"
        value={form.grupo_sanguineo ?? ""}
        onChange={(e) =>
          set(
            "grupo_sanguineo",
            e.target.value as PacienteInput["grupo_sanguineo"],
          )
        }
      >
        <option value="">—</option>
        {GRUPOS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </Select>
      <Select
        label="¿De dónde viene el paciente?"
        value={form.procedencia ?? ""}
        onChange={(e) =>
          set("procedencia", e.target.value as PacienteInput["procedencia"])
        }
      >
        <option value="">Sin especificar</option>
        {Object.entries(PROCEDENCIA).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </Select>
      <Input
        label="Centro educativo"
        value={form.centro_educativo ?? ""}
        onChange={(e) => set("centro_educativo", e.target.value)}
      />
      <Input
        label="Nombre del padre"
        value={form.nombre_padre ?? ""}
        onChange={(e) => set("nombre_padre", e.target.value)}
      />
      <Input
        label="Nombre de la madre"
        value={form.nombre_madre ?? ""}
        onChange={(e) => set("nombre_madre", e.target.value)}
      />
      <Input
        label="Teléfono"
        value={form.telefono ?? ""}
        onChange={(e) => set("telefono", e.target.value)}
      />
      <Input
        label="WhatsApp (para recordatorios)"
        value={form.whatsapp ?? ""}
        onChange={(e) => set("whatsapp", e.target.value)}
      />
      <Input
        label="Correo"
        type="email"
        value={form.correo ?? ""}
        onChange={(e) => set("correo", e.target.value)}
      />
      <Input
        label="Dirección"
        className="sm:col-span-2"
        value={form.direccion ?? ""}
        onChange={(e) => set("direccion", e.target.value)}
      />

      {error && <p className="text-sm text-rose-500 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
