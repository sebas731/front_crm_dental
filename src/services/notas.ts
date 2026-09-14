import { api, fetchAllPages } from "./api";
import type { NotaAgenda } from "@/types";

/** TODAS las notas de la agenda en el rango (recorre todas las páginas). */
export function listNotas(params: {
  desde: string;
  hasta: string;
}): Promise<NotaAgenda[]> {
  const qs = new URLSearchParams(params);
  return fetchAllPages<NotaAgenda>(`/notas-agenda/?${qs.toString()}`);
}

export function createNota(data: {
  fecha: string;
  hora: string;
  texto: string;
}): Promise<NotaAgenda> {
  return api.post<NotaAgenda>("/notas-agenda/", data);
}

export function deleteNota(id: string): Promise<void> {
  return api.delete<void>(`/notas-agenda/${id}/`);
}
