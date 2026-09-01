import { api } from "./api";
import type { NotaAgenda, Paginated } from "@/types";

export function listNotas(params: {
  desde: string;
  hasta: string;
}): Promise<Paginated<NotaAgenda>> {
  const qs = new URLSearchParams(params);
  qs.set("page_size", "300");
  return api.get<Paginated<NotaAgenda>>(`/notas-agenda/?${qs.toString()}`);
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
