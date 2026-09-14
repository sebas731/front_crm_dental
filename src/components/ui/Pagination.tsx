"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE } from "@/services/api";

/**
 * Controles de paginación para las tablas. Muestra "Anterior / Página X de Y /
 * Siguiente" y el rango de registros. No se renderiza si hay una sola página.
 */
export function Pagination({
  page,
  count,
  onPage,
  pageSize = PAGE_SIZE,
}: {
  page: number;
  count: number;
  onPage: (page: number) => void;
  pageSize?: number;
}) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  if (count === 0) return null;

  const desde = (page - 1) * pageSize + 1;
  const hasta = Math.min(page * pageSize, count);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3 text-sm">
      <span className="text-slate-500">
        {desde}–{hasta} de {count}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </button>
        <span className="text-slate-500">
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
