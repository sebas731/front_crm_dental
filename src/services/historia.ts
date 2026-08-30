import { api, apiFetch } from "./api";
import type {
  AntecedentesInput,
  AntecedentesPersonales,
  DocumentoHC,
  HistoriaClinica,
  Odontograma,
  OdontogramaInput,
  Paginated,
} from "@/types";

// --- Historia clínica ---
export function getHistoriaByPaciente(
  pacienteId: string,
): Promise<HistoriaClinica | null> {
  return api
    .get<Paginated<HistoriaClinica>>(
      `/historias-clinicas/?paciente=${pacienteId}`,
    )
    .then((r) => r.results[0] ?? null);
}

export function createHistoria(
  pacienteId: string,
  numero: string,
): Promise<HistoriaClinica> {
  return api.post<HistoriaClinica>("/historias-clinicas/", {
    paciente: pacienteId,
    numero,
  });
}

// --- Documentos (subida de archivo) ---
export function subirDocumento(
  historiaId: string,
  data: { tipo: string; titulo: string; descripcion: string; archivo: File },
): Promise<DocumentoHC> {
  const fd = new FormData();
  fd.append("historia_clinica", historiaId);
  fd.append("tipo", data.tipo);
  fd.append("titulo", data.titulo);
  fd.append("descripcion", data.descripcion);
  fd.append("archivo", data.archivo);
  return apiFetch<DocumentoHC>("/documentos/", {
    method: "POST",
    formData: fd,
  });
}

export function eliminarDocumento(id: string): Promise<void> {
  return api.delete<void>(`/documentos/${id}/`);
}

// --- Odontograma ---
export function crearOdontograma(data: OdontogramaInput): Promise<Odontograma> {
  return api.post<Odontograma>("/odontogramas/", data);
}

export function actualizarOdontograma(
  id: string,
  data: OdontogramaInput,
): Promise<Odontograma> {
  return api.patch<Odontograma>(`/odontogramas/${id}/`, data);
}

// --- Antecedentes personales y familiares ---
export function crearAntecedentes(
  historiaId: string,
  data: AntecedentesInput,
): Promise<AntecedentesPersonales> {
  return api.post<AntecedentesPersonales>("/antecedentes/", {
    ...data,
    historia_clinica: historiaId,
  });
}

export function actualizarAntecedentes(
  id: string,
  data: AntecedentesInput,
): Promise<AntecedentesPersonales> {
  return api.patch<AntecedentesPersonales>(`/antecedentes/${id}/`, data);
}
