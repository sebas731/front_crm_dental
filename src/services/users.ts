import { api } from "./api";
import type { Paginated, User } from "@/types";

export function listUsers(): Promise<Paginated<User>> {
  return api.get<Paginated<User>>("/users/?page_size=300");
}
