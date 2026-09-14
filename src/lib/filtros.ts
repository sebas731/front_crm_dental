import type { Cita, EstadoCita } from "@/types";

export interface CitaFiltros {
  paciente: string;
  servicio: string;
  // Estados seleccionados (multi). Vacío = todos.
  estados: EstadoCita[];
  desde: string;
  hasta: string;
}

export const FILTROS_VACIOS: CitaFiltros = {
  paciente: "",
  servicio: "",
  estados: [],
  desde: "",
  hasta: "",
};

/** Aplica los filtros (todos opcionales) sobre una lista de citas. */
export function filterCitas(citas: Cita[], f: CitaFiltros): Cita[] {
  return citas.filter((c) => {
    if (f.paciente && c.paciente !== f.paciente) return false;
    if (f.servicio && c.servicio !== f.servicio) return false;
    if (f.estados.length && !f.estados.includes(c.estado)) return false;
    if (f.desde && c.fecha < f.desde) return false;
    if (f.hasta && c.fecha > f.hasta) return false;
    return true;
  });
}

export function hayFiltrosActivos(f: CitaFiltros): boolean {
  return Boolean(
    f.paciente || f.servicio || f.estados.length || f.desde || f.hasta,
  );
}

export type PeriodoRango = "hoy" | "semana" | "mes" | "todas";

function ymdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Devuelve el rango de fechas {desde, hasta} para un período rápido. */
export function rangoDePeriodo(periodo: PeriodoRango): {
  desde: string;
  hasta: string;
} {
  const hoy = new Date();
  if (periodo === "hoy") {
    const d = ymdLocal(hoy);
    return { desde: d, hasta: d };
  }
  if (periodo === "semana") {
    const dow = (hoy.getDay() + 6) % 7; // lunes = 0
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - dow);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    return { desde: ymdLocal(lunes), hasta: ymdLocal(domingo) };
  }
  if (periodo === "mes") {
    const primero = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    return { desde: ymdLocal(primero), hasta: ymdLocal(ultimo) };
  }
  return { desde: "", hasta: "" }; // "todas"
}

/** Deduce qué período rápido corresponde al rango actual (o null si es libre). */
export function periodoDeRango(f: CitaFiltros): PeriodoRango | null {
  if (!f.desde && !f.hasta) return "todas";
  for (const p of ["hoy", "semana", "mes"] as PeriodoRango[]) {
    const r = rangoDePeriodo(p);
    if (r.desde === f.desde && r.hasta === f.hasta) return p;
  }
  return null;
}
