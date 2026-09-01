"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export type EstadoCarga = "cargando" | "notfound" | "server";

/**
 * Estado de carga/errores de una página de detalle. Distingue "no encontrado"
 * (404) de un error real del servidor, en vez de mostrar el mismo mensaje.
 */
export function CargaEstado({
  estado,
  entidad,
  volverHref,
  volverLabel,
}: {
  estado: EstadoCarga;
  entidad: string;
  volverHref: string;
  volverLabel: string;
}) {
  return (
    <AppShell>
      {estado === "cargando" ? (
        <p className="text-slate-500">Cargando…</p>
      ) : (
        <div className="space-y-2">
          <p className="text-slate-600">
            {estado === "notfound"
              ? `${entidad} no encontrado.`
              : "No se pudo cargar por un error del servidor. Intentá de nuevo en un momento."}
          </p>
          <Link href={volverHref} className="text-teal-600 underline">
            {volverLabel}
          </Link>
        </div>
      )}
    </AppShell>
  );
}
