import { api, fetchAllPages } from "./api";
import type {
  AtencionInput,
  Cita,
  CitaInput,
  HorarioAtencion,
  HorarioInput,
  Medico,
  MedicoInput,
  Paginated,
  ServicioDental,
} from "@/types";

// --- Citas ---
/** Una página de citas (15/página). Para la tabla con paginación. */
export function listCitas(params?: {
  search?: string;
  page?: number;
}): Promise<Paginated<Cita>> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  return api.get<Paginated<Cita>>(`/citas/?${qs.toString()}`);
}

/** TODAS las citas (recorre todas las páginas). Para agenda, dashboard y
 *  cronograma, que arman el calendario con el conjunto completo. */
export function listAllCitas(search?: string): Promise<Cita[]> {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  const q = qs.toString();
  return fetchAllPages<Cita>(`/citas/${q ? `?${q}` : ""}`);
}

export function getCita(id: string): Promise<Cita> {
  return api.get<Cita>(`/citas/${id}/`);
}

/** Todas las citas de un paciente (para su ficha). */
export function listCitasByPaciente(pacienteId: string): Promise<Cita[]> {
  return fetchAllPages<Cita>(`/citas/?paciente=${pacienteId}`);
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
/** Una página de médicos (15/página). Para la tabla de Médicos. */
export function listMedicos(params?: {
  page?: number;
}): Promise<Paginated<Medico>> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  const q = qs.toString();
  return api.get<Paginated<Medico>>(`/medicos/${q ? `?${q}` : ""}`);
}

/** TODOS los médicos. Para los selectores de citas/ventas y la agenda. */
export function listAllMedicos(): Promise<Medico[]> {
  return fetchAllPages<Medico>("/medicos/");
}

export function createMedico(data: MedicoInput): Promise<Medico> {
  return api.post<Medico>("/medicos/", data);
}

export function updateMedico(
  id: string,
  data: Partial<MedicoInput>,
): Promise<Medico> {
  return api.patch<Medico>(`/medicos/${id}/`, data);
}

export function deleteMedico(id: string): Promise<void> {
  return api.delete<void>(`/medicos/${id}/`);
}

/** Una página de servicios (15/página). Para la tabla de Servicios. */
export function listServicios(params?: {
  page?: number;
}): Promise<Paginated<ServicioDental>> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  const q = qs.toString();
  return api.get<Paginated<ServicioDental>>(`/servicios/${q ? `?${q}` : ""}`);
}

/** TODO el catálogo de servicios (categorías + subservicios). Para los
 *  selectores de citas/ventas y el dashboard. */
export function listAllServicios(): Promise<ServicioDental[]> {
  return fetchAllPages<ServicioDental>("/servicios/");
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
