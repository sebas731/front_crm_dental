import type { Cita } from "@/types";

export interface CitaFiltros {
  paciente: string;
  servicio: string;
  estado: string;
  desde: string;
  hasta: string;
}

export const FILTROS_VACIOS: CitaFiltros = {
  paciente: "",
  servicio: "",
  estado: "",
  desde: "",
  hasta: "",
};

/** Aplica los filtros (todos opcionales) sobre una lista de citas. */
export function filterCitas(citas: Cita[], f: CitaFiltros): Cita[] {
  return citas.filter((c) => {
    if (f.paciente && c.paciente !== f.paciente) return false;
    if (f.servicio && c.servicio !== f.servicio) return false;
    if (f.estado && c.estado !== f.estado) return false;
    if (f.desde && c.fecha < f.desde) return false;
    if (f.hasta && c.fecha > f.hasta) return false;
    return true;
  });
}

export function hayFiltrosActivos(f: CitaFiltros): boolean {
  return Boolean(f.paciente || f.servicio || f.estado || f.desde || f.hasta);
}
