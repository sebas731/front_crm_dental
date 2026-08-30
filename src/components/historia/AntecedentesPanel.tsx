"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { actualizarAntecedentes, crearAntecedentes } from "@/services/historia";
import type { AntecedentesInput, AntecedentesPersonales } from "@/types";

type TextKey = Exclude<
  keyof AntecedentesInput,
  "cartilla_vacunacion_completa" | "lactancia_materna"
>;

const CAMPOS: { key: TextKey; label: string }[] = [
  { key: "alergias", label: "Alergias (medicamento, alimento o sustancia)" },
  {
    key: "enfermedades_pulmonares",
    label: "Pulmonares (TBC, asma, influenza…)",
  },
  { key: "enfermedades_cardiacas", label: "Cardíacas (hipertensión, soplo…)" },
  {
    key: "enfermedades_neurologicas",
    label: "Neurológicas (epilepsia, Parkinson…)",
  },
  { key: "enfermedades_hepaticas", label: "Hepáticas (hepatitis, cirrosis…)" },
  { key: "enfermedades_renales", label: "Renales (cálculos, infecciones…)" },
  { key: "sistema_endocrino", label: "Endocrino (diabetes, hipotiroidismo…)" },
  { key: "musculo_esqueletico", label: "Músculo-esquelético (artritis…)" },
  { key: "otras_enfermedades", label: "Otras enfermedades" },
  {
    key: "enfermedad_cronica_y_tratamiento",
    label: "Enfermedad crónica y tratamiento",
  },
  { key: "problema_comportamiento", label: "Problemas de comportamiento" },
  { key: "experiencia_dental_previa", label: "Experiencia dental previa" },
  { key: "revision_sistemica", label: "Revisión sistémica (lo restante)" },
];

export function AntecedentesPanel({
  historiaId,
  antecedentes,
  onSaved,
}: {
  historiaId: string;
  antecedentes: AntecedentesPersonales | null;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState<AntecedentesInput>({
    alergias: antecedentes?.alergias ?? "",
    enfermedades_pulmonares: antecedentes?.enfermedades_pulmonares ?? "",
    enfermedades_cardiacas: antecedentes?.enfermedades_cardiacas ?? "",
    enfermedades_neurologicas: antecedentes?.enfermedades_neurologicas ?? "",
    enfermedades_hepaticas: antecedentes?.enfermedades_hepaticas ?? "",
    enfermedades_renales: antecedentes?.enfermedades_renales ?? "",
    sistema_endocrino: antecedentes?.sistema_endocrino ?? "",
    musculo_esqueletico: antecedentes?.musculo_esqueletico ?? "",
    otras_enfermedades: antecedentes?.otras_enfermedades ?? "",
    enfermedad_cronica_y_tratamiento:
      antecedentes?.enfermedad_cronica_y_tratamiento ?? "",
    problema_comportamiento: antecedentes?.problema_comportamiento ?? "",
    experiencia_dental_previa: antecedentes?.experiencia_dental_previa ?? "",
    revision_sistemica: antecedentes?.revision_sistemica ?? "",
    lactancia_materna: antecedentes?.lactancia_materna ?? "",
    cartilla_vacunacion_completa:
      antecedentes?.cartilla_vacunacion_completa ?? false,
  });
  const [saving, setSaving] = useState(false);

  const set = (patch: Partial<AntecedentesInput>) =>
    setForm((f) => ({ ...f, ...patch }));

  async function handleSave() {
    setSaving(true);
    try {
      if (antecedentes) await actualizarAntecedentes(antecedentes.id, form);
      else await crearAntecedentes(historiaId, form);
      await onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-200"
          checked={Boolean(form.cartilla_vacunacion_completa)}
          onChange={(e) =>
            set({ cartilla_vacunacion_completa: e.target.checked })
          }
        />
        Cuenta con cartilla de vacunación completa
      </label>

      <Input
        label="Lactancia materna (tiempo y tipo)"
        value={form.lactancia_materna ?? ""}
        onChange={(e) => set({ lactancia_materna: e.target.value })}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {CAMPOS.map(({ key, label }) => (
          <Textarea
            key={key}
            label={label}
            rows={2}
            value={(form[key] as string) ?? ""}
            onChange={(e) => set({ [key]: e.target.value })}
          />
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving
          ? "Guardando…"
          : antecedentes
            ? "Actualizar antecedentes"
            : "Guardar antecedentes"}
      </Button>
    </div>
  );
}
