import { api, fetchAllPages } from "./api";
import type { Paciente, PacienteInput, Paginated } from "@/types";

const BASE = "/pacientes/";

/** Una página de pacientes (15/página). Para la tabla con paginación. */
export function listPacientes(params?: {
  search?: string;
  page?: number;
}): Promise<Paginated<Paciente>> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  return api.get<Paginated<Paciente>>(`${BASE}?${qs.toString()}`);
}

/** TODOS los pacientes (recorre todas las páginas). Para dashboard, agenda,
 *  reportes y los buscadores por DNI, que necesitan el conjunto completo. */
export function listAllPacientes(search?: string): Promise<Paciente[]> {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  const q = qs.toString();
  return fetchAllPages<Paciente>(`${BASE}${q ? `?${q}` : ""}`);
}

export function getPaciente(id: string): Promise<Paciente> {
  return api.get<Paciente>(`${BASE}${id}/`);
}

export function createPaciente(data: PacienteInput): Promise<Paciente> {
  return api.post<Paciente>(BASE, data);
}

export function updatePaciente(
  id: string,
  data: PacienteInput,
): Promise<Paciente> {
  return api.patch<Paciente>(`${BASE}${id}/`, data);
}

export function deletePaciente(id: string): Promise<void> {
  return api.delete<void>(`${BASE}${id}/`);
}
