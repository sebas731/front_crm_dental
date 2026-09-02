import { api } from "./api";
import type { Paginated, User, UserInput } from "@/types";

export function listUsers(): Promise<Paginated<User>> {
  return api.get<Paginated<User>>("/users/?page_size=300");
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
