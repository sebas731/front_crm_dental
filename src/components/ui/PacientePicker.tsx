"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Paciente } from "@/types";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm " +
  "text-slate-800 outline-none transition-colors placeholder:text-slate-400 " +
  "focus:border-teal-400 focus:ring-2 focus:ring-teal-200";

/** Combobox de pacientes: busca por nombre o por DNI (número de documento). */
export function PacientePicker({
  pacientes,
  value,
  onChange,
  label = "Paciente",
  placeholder = "Buscar por nombre o DNI…",
  allowTodos = true,
}: {
  pacientes: Paciente[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  placeholder?: string;
  allowTodos?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selected = pacientes.find((p) => p.id === value);
  const nombre = (p: Paciente) =>
    `${p.nombres} ${p.apellido_paterno} ${p.apellido_materno}`.trim();
  const display = open
    ? query
    : selected
      ? `${nombre(selected)} · DNI ${selected.numero_documento}`
      : "";

  const q = query.toLowerCase();
  const matches = pacientes
    .filter((p) =>
      `${nombre(p)} ${p.numero_documento}`.toLowerCase().includes(q),
    )
    .slice(0, 40);

  return (
    <div className="relative space-y-1" ref={ref}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className={inputClass}
          value={display}
          placeholder={placeholder}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
      </div>

      {open && (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200/70 bg-white p-1 shadow-lg">
          {allowTodos && (
            <button
              type="button"
              onMouseDown={() => {
                onChange("");
                setOpen(false);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50"
            >
              Todos los pacientes
            </button>
          )}
          {matches.map((p) => (
            <button
              key={p.id}
              type="button"
              onMouseDown={() => {
                onChange(p.id);
                setOpen(false);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">{nombre(p)}</span>
              <span className="block text-xs text-slate-400">
                DNI {p.numero_documento}
              </span>
            </button>
          ))}
          {matches.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-400">Sin resultados.</p>
          )}
        </div>
      )}
    </div>
  );
}
