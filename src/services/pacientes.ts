import { api } from "./api";
import type { Paciente, PacienteInput, Paginated } from "@/types";

const BASE = "/pacientes/";

export function listPacientes(params?: {
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<Paginated<Paciente>> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  // Sin page_size explícito trae hasta 500 (el máximo del backend): así el
  // buscador/agenda/dashboard no se quedan solo con los primeros 20.
  qs.set("page_size", String(params?.page_size ?? 500));
  return api.get<Paginated<Paciente>>(`${BASE}?${qs.toString()}`);
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
