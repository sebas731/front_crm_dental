"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ESTADO_CITA } from "@/lib/estados";
import type { EstadoCita } from "@/types";

const ESTADOS = Object.keys(ESTADO_CITA) as EstadoCita[];

/**
 * Combobox de estados de cita: un botón "Estado" que despliega un popover con
 * checkboxes (Todos + cada estado con su color) y un botón Aplicar. Multi-
 * selección; sin selección = todos. Se usa arriba de la agenda.
 */
export function EstadoCitaFilter({
  value,
  onChange,
}: {
  value: EstadoCita[];
  onChange: (estados: EstadoCita[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<EstadoCita[]>(value);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera del popover.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function abrir() {
    setDraft(value); // arranca desde lo ya aplicado
    setOpen(true);
  }

  const todos = draft.length === 0;
  const toggle = (e: EstadoCita) =>
    setDraft((d) => (d.includes(e) ? d.filter((x) => x !== e) : [...d, e]));

  function aplicar() {
    onChange(draft);
    setOpen(false);
  }

  const activos = value.length;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : abrir())}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
      >
        Estado
        {activos > 0 && (
          <span className="rounded-full bg-teal-600 px-1.5 text-xs font-semibold text-white">
            {activos}
          </span>
        )}
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
          <Fila
            label="Todos"
            checked={todos}
            onClick={() => setDraft([])}
            fuerte
          />
          <div className="my-2 h-px bg-slate-100" />
          <div className="grid grid-cols-2 gap-1">
            {ESTADOS.map((e) => (
              <Fila
                key={e}
                label={ESTADO_CITA[e].label}
                color={ESTADO_CITA[e].color}
                checked={draft.includes(e)}
                onClick={() => toggle(e)}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={aplicar}
              className="rounded-lg bg-teal-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Fila({
  label,
  checked,
  onClick,
  color,
  fuerte = false,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  color?: string;
  fuerte?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
          checked ? "border-teal-600 bg-teal-600" : "border-slate-300 bg-white"
        }`}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </span>
      {color && (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span className={fuerte ? "font-medium text-slate-700" : "text-slate-600"}>
        {label}
      </span>
    </button>
  );
}
