"use client";

import { Check } from "lucide-react";
import { ESTADO_CITA } from "@/lib/estados";
import type { EstadoCita } from "@/types";

const ESTADOS = Object.keys(ESTADO_CITA) as EstadoCita[];

/**
 * Filtro de estados de cita como chips de color (multi-selección, instantáneo).
 * Cada chip usa el color del estado que ya maneja el sistema. Sin selección =
 * "Todos". Se muestra arriba de la agenda/lista de citas.
 */
export function EstadoCitaFilter({
  value,
  onChange,
}: {
  value: EstadoCita[];
  onChange: (estados: EstadoCita[]) => void;
}) {
  const todos = value.length === 0;

  const toggle = (e: EstadoCita) =>
    onChange(
      value.includes(e) ? value.filter((x) => x !== e) : [...value, e],
    );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-slate-500">Estado</span>

      <button
        type="button"
        onClick={() => onChange([])}
        className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
          todos
            ? "border-teal-600 bg-teal-600 text-white"
            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
        }`}
      >
        Todos
      </button>

      {ESTADOS.map((e) => {
        const { label, color } = ESTADO_CITA[e];
        const on = value.includes(e);
        return (
          <button
            key={e}
            type="button"
            onClick={() => toggle(e)}
            aria-pressed={on}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors"
            style={
              on
                ? {
                    backgroundColor: `${color}1f`,
                    borderColor: color,
                    color,
                  }
                : {
                    backgroundColor: "#fff",
                    borderColor: "#e2e8f0",
                    color: "#64748b",
                  }
            }
          >
            {on ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}
