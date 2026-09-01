"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { TagInput } from "@/components/ui/TagInput";
import { mensajeError } from "@/lib/apiError";
import { actualizarAntecedentes, crearAntecedentes } from "@/services/historia";
import type { AntecedentesInput, AntecedentesPersonales } from "@/types";

type TextKey = Exclude<
  keyof AntecedentesInput,
  "cartilla_vacunacion_completa" | "lactancia_materna"
>;

// `tag: true` → campo de etiquetas (chips tipo Facebook).
const CAMPOS: { key: TextKey; label: string; tag?: boolean }[] = [
  {
    key: "alergias",
    label: "Alergias (medicamento, alimento o sustancia)",
    tag: true,
  },
  {
    key: "enfermedades_pulmonares",
    label: "Pulmonares (TBC, asma, influenza…)",
    tag: true,
  },
  {
    key: "enfermedades_cardiacas",
    label: "Cardíacas (hipertensión, soplo…)",
    tag: true,
  },
  {
    key: "enfermedades_neurologicas",
    label: "Neurológicas (epilepsia, Parkinson…)",
    tag: true,
  },
  {
    key: "enfermedades_hepaticas",
    label: "Hepáticas (hepatitis, cirrosis…)",
    tag: true,
  },
  {
    key: "enfermedades_renales",
    label: "Renales (cálculos, infecciones…)",
    tag: true,
  },
  {
    key: "sistema_endocrino",
    label: "Endocrino (diabetes, hipotiroidismo…)",
    tag: true,
  },
  {
    key: "musculo_esqueletico",
    label: "Músculo-esquelético (artritis…)",
    tag: true,
  },
  { key: "otras_enfermedades", label: "Otras enfermedades", tag: true },
  {
    key: "enfermedad_cronica_y_tratamiento",
    label: "Enfermedad crónica y tratamiento",
    tag: true,
  },
  { key: "problema_comportamiento", label: "Problemas de comportamiento" },
  { key: "experiencia_dental_previa", label: "Experiencia dental previa" },
  { key: "revision_sistemica", label: "Revisión sistémica (lo restante)" },
];

export function AntecedentesPanel({
  historiaId,
  antecedentes,
  onSaved,
  readOnly = false,
}: {
  historiaId: string;
  antecedentes: AntecedentesPersonales | null;
  onSaved: () => void | Promise<void>;
  readOnly?: boolean;
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
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<AntecedentesInput>) =>
    setForm((f) => ({ ...f, ...patch }));

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (antecedentes) await actualizarAntecedentes(antecedentes.id, form);
      else await crearAntecedentes(historiaId, form);
      await onSaved();
    } catch (err) {
      setError(mensajeError(err, "No se pudieron guardar los antecedentes."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <fieldset disabled={readOnly} className="m-0 space-y-3 border-0 p-0">
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
        {CAMPOS.map(({ key, label, tag }) =>
          tag ? (
            <TagInput
              key={key}
              label={label}
              value={(form[key] as string) ?? ""}
              onChange={(v) => set({ [key]: v })}
            />
          ) : (
            <Textarea
              key={key}
              label={label}
              rows={2}
              value={(form[key] as string) ?? ""}
              onChange={(e) => set({ [key]: e.target.value })}
            />
          ),
        )}
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}

      {!readOnly && (
        <Button onClick={handleSave} disabled={saving}>
          {saving
            ? "Guardando…"
            : antecedentes
              ? "Actualizar antecedentes"
              : "Guardar antecedentes"}
        </Button>
      )}
    </fieldset>
  );
}
