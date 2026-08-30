import { api } from "./api";
import type { Paciente, PacienteInput, Paginated } from "@/types";

const BASE = "/pacientes/";

export function listPacientes(params?: {
  search?: string;
  page?: number;
}): Promise<Paginated<Paciente>> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return api.get<Paginated<Paciente>>(`${BASE}${suffix}`);
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
