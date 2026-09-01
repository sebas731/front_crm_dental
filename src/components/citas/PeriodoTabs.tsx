"use client";

import type { PeriodoRango } from "@/lib/filtros";

const OPCIONES: { key: PeriodoRango; label: string }[] = [
  { key: "hoy", label: "Hoy" },
  { key: "semana", label: "Esta semana" },
  { key: "mes", label: "Este mes" },
  { key: "todas", label: "Todas" },
];

/** Control segmentado de período rápido (estilo CRM). `activo` = null → rango libre. */
export function PeriodoTabs({
  activo,
  onSelect,
}: {
  activo: PeriodoRango | null;
  onSelect: (p: PeriodoRango) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
      {OPCIONES.map(({ key, label }) => {
        const on = activo === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              on
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        );
      })}
      {activo === null && (
        <span className="flex items-center px-3 text-xs font-medium text-teal-600">
          Rango personalizado
        </span>
      )}
    </div>
  );
}
