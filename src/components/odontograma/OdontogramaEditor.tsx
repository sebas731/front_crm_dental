"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { actualizarOdontograma, crearOdontograma } from "@/services/historia";
import type { DienteEstado, Odontograma } from "@/types";
import { ESTADOS_DIENTE, FILAS_DIENTES } from "./dientes";

type Footer = Pick<
  Odontograma,
  | "especificaciones"
  | "informe_radiografico"
  | "higiene_bucal"
  | "ihos"
  | "diagnostico"
  | "cie"
  | "plan_tratamiento"
  | "observaciones"
>;

const FOOTER_EMPTY: Footer = {
  especificaciones: "",
  informe_radiografico: "",
  higiene_bucal: "",
  ihos: "",
  diagnostico: "",
  cie: "",
  plan_tratamiento: "",
  observaciones: "",
};

export function OdontogramaEditor({
  historiaId,
  odontograma,
  onSaved,
}: {
  historiaId: string;
  odontograma: Odontograma | null;
  onSaved: (o: Odontograma) => void;
}) {
  const [dientes, setDientes] = useState<Record<string, DienteEstado>>(
    odontograma?.dientes ?? {},
  );
  const [footer, setFooter] = useState<Footer>({
    ...FOOTER_EMPTY,
    ...(odontograma ?? {}),
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setEstado(estado: string) {
    if (!selected) return;
    setDientes((d) => {
      const next = { ...d };
      if (estado === "") delete next[selected];
      else next[selected] = { ...next[selected], estado };
      return next;
    });
  }

  function setFooterField<K extends keyof Footer>(k: K, v: Footer[K]) {
    setFooter((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { historia_clinica: historiaId, dientes, ...footer };
      const saved = odontograma
        ? await actualizarOdontograma(odontograma.id, payload)
        : await crearOdontograma(payload);
      onSaved(saved);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Dientes */}
      <div className="overflow-x-auto">
        <div className="inline-block space-y-1">
          {FILAS_DIENTES.map((fila, i) => (
            <div key={i} className="flex justify-center gap-1">
              {fila.map((num) => {
                const est = dientes[num]?.estado ?? "";
                const color = ESTADOS_DIENTE[est]?.color ?? "#ffffff";
                const isSel = selected === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSelected(num)}
                    title={ESTADOS_DIENTE[est]?.label}
                    className={`h-9 w-9 rounded border text-xs ${
                      isSel
                        ? "border-primary ring-primary ring-2"
                        : "border-border"
                    }`}
                    style={{
                      backgroundColor: est ? color : "#ffffff",
                      color: est && est !== "" ? "#fff" : "inherit",
                    }}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selector de estado para la pieza seleccionada */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted text-sm">
          {selected ? `Pieza ${selected}:` : "Seleccioná una pieza"}
        </span>
        {Object.entries(ESTADOS_DIENTE).map(([k, v]) => (
          <button
            key={k}
            type="button"
            disabled={!selected}
            onClick={() => setEstado(k)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs disabled:opacity-40"
            style={k ? { borderColor: v.color, color: v.color } : undefined}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Pie de la ficha */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Textarea
          label="Especificaciones"
          rows={2}
          value={footer.especificaciones}
          onChange={(e) => setFooterField("especificaciones", e.target.value)}
        />
        <Textarea
          label="Informe radiográfico"
          rows={2}
          value={footer.informe_radiografico}
          onChange={(e) =>
            setFooterField("informe_radiografico", e.target.value)
          }
        />
        <Input
          label="Higiene bucal"
          value={footer.higiene_bucal}
          onChange={(e) => setFooterField("higiene_bucal", e.target.value)}
        />
        <Input
          label="IHOS"
          value={footer.ihos}
          onChange={(e) => setFooterField("ihos", e.target.value)}
        />
        <Textarea
          label="Diagnóstico"
          rows={2}
          value={footer.diagnostico}
          onChange={(e) => setFooterField("diagnostico", e.target.value)}
        />
        <Input
          label="CIE"
          value={footer.cie}
          onChange={(e) => setFooterField("cie", e.target.value)}
        />
        <Textarea
          label="Plan de tratamiento"
          rows={2}
          value={footer.plan_tratamiento}
          onChange={(e) => setFooterField("plan_tratamiento", e.target.value)}
        />
        <Textarea
          label="Observaciones"
          rows={2}
          value={footer.observaciones}
          onChange={(e) => setFooterField("observaciones", e.target.value)}
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving
          ? "Guardando…"
          : odontograma
            ? "Actualizar odontograma"
            : "Guardar odontograma"}
      </Button>
    </div>
  );
}
