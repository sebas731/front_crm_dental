import { api, clearTokens, setRefreshToken, setToken } from "./api";
import type { TokenPair, User } from "@/types";

/** Log in with username + password; stores the JWT pair. */
export async function login(
  username: string,
  password: string,
): Promise<TokenPair> {
  const tokens = await api.post<TokenPair>(
    "/auth/token/",
    { username, password },
    { auth: false },
  );
  setToken(tokens.access);
  setRefreshToken(tokens.refresh);
  return tokens;
}

/** Clear stored tokens. */
export function logout(): void {
  clearTokens();
}

/** Fetch the authenticated user. */
export function getMe(): Promise<User> {
  return api.get<User>("/users/me/");
}
