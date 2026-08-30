import { api } from "./api";
import type {
  AtencionInput,
  Cita,
  CitaInput,
  HorarioAtencion,
  HorarioInput,
  Medico,
  Paginated,
  ServicioDental,
} from "@/types";

// --- Citas ---
export function listCitas(params?: {
  search?: string;
  page?: number;
}): Promise<Paginated<Cita>> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return api.get<Paginated<Cita>>(`/citas/${suffix}`);
}

export function getCita(id: string): Promise<Cita> {
  return api.get<Cita>(`/citas/${id}/`);
}

export function listCitasByPaciente(
  pacienteId: string,
): Promise<Paginated<Cita>> {
  return api.get<Paginated<Cita>>(`/citas/?paciente=${pacienteId}`);
}

export function createCita(data: CitaInput): Promise<Cita> {
  return api.post<Cita>("/citas/", data);
}

export function updateCita(id: string, data: CitaInput): Promise<Cita> {
  return api.patch<Cita>(`/citas/${id}/`, data);
}

export function deleteCita(id: string): Promise<void> {
  return api.delete<void>(`/citas/${id}/`);
}

/** Registra la atención (detalle) de una cita y actualiza su estado. */
export function atenderCita(id: string, data: AtencionInput): Promise<Cita> {
  return api.post<Cita>(`/citas/${id}/atender/`, data);
}

// --- Catálogos ---
export function listMedicos(): Promise<Paginated<Medico>> {
  return api.get<Paginated<Medico>>("/medicos/");
}

export function listServicios(): Promise<Paginated<ServicioDental>> {
  // page_size alto para traer todo el catálogo (categorías + subservicios).
  return api.get<Paginated<ServicioDental>>("/servicios/?page_size=300");
}

export function createServicio(
  data: Partial<ServicioDental>,
): Promise<ServicioDental> {
  return api.post<ServicioDental>("/servicios/", data);
}

export function deleteServicio(id: string): Promise<void> {
  return api.delete<void>(`/servicios/${id}/`);
}

// --- Horarios ---
export function listHorarios(): Promise<Paginated<HorarioAtencion>> {
  return api.get<Paginated<HorarioAtencion>>("/horarios/");
}

export function createHorario(data: HorarioInput): Promise<HorarioAtencion> {
  return api.post<HorarioAtencion>("/horarios/", data);
}

export function deleteHorario(id: string): Promise<void> {
  return api.delete<void>(`/horarios/${id}/`);
}
