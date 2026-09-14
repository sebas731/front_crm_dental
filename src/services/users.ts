import { api, fetchAllPages } from "./api";
import type { Paginated, User, UserInput } from "@/types";

/** Una página de usuarios (15/página). Para la tabla de Usuarios. */
export function listUsers(params?: { page?: number }): Promise<Paginated<User>> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  const q = qs.toString();
  return api.get<Paginated<User>>(`/users/${q ? `?${q}` : ""}`);
}

/** TODOS los usuarios. Para el dashboard (ranking de vendedores). */
export function listAllUsers(): Promise<User[]> {
  return fetchAllPages<User>("/users/");
}

export function createUser(data: UserInput): Promise<User> {
  return api.post<User>("/users/", data);
}

export function updateUser(
  id: number,
  data: Partial<UserInput>,
): Promise<User> {
  return api.patch<User>(`/users/${id}/`, data);
}

export function deleteUser(id: number): Promise<void> {
  return api.delete<void>(`/users/${id}/`);
}
