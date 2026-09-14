"use client";

import { Filter, X } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { PacientePicker } from "@/components/ui/PacientePicker";
import { ServicioSelect } from "@/components/servicios/ServicioSelect";
import {
  FILTROS_VACIOS,
  hayFiltrosActivos,
  type CitaFiltros,
} from "@/lib/filtros";
import type { Paciente, ServicioDental } from "@/types";

export function CitasFilterBar({
  filtros,
  onChange,
  pacientes,
  servicios,
}: {
  filtros: CitaFiltros;
  onChange: (f: CitaFiltros) => void;
  pacientes: Paciente[];
  servicios: ServicioDental[];
}) {
  const set = (patch: Partial<CitaFiltros>) =>
    onChange({ ...filtros, ...patch });

  return (
    <div className="mb-5 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Filter className="h-4 w-4" /> Filtros
        </span>
        {hayFiltrosActivos(filtros) && (
          <button
            onClick={() => onChange(FILTROS_VACIOS)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
          >
            <X className="h-3.5 w-3.5" /> Limpiar
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <PacientePicker
          pacientes={pacientes}
          value={filtros.paciente}
          onChange={(id) => set({ paciente: id })}
        />
        <ServicioSelect
          label="Servicio"
          servicios={servicios}
          value={filtros.servicio}
          onChange={(v) => set({ servicio: v })}
          placeholder="Todos"
        />
        <Input
          label="Desde"
          type="date"
          value={filtros.desde}
          onChange={(e) => set({ desde: e.target.value })}
        />
        <Input
          label="Hasta"
          type="date"
          value={filtros.hasta}
          onChange={(e) => set({ hasta: e.target.value })}
        />
      </div>
    </div>
  );
}
