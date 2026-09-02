/**
 * Base HTTP client for the dental CRM backend.
 *
 * Wraps `fetch` with JSON handling, the API base URL from the environment,
 * and JWT bearer auth with automatic refresh on 401. Feature services
 * (e.g. `pacientes.ts`) are built on top of `apiFetch` / `api`.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

/** Read the access token (browser only). Returns null on the server. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

/** Persist the access token (browser only). Pass null to clear it. */
export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(ACCESS_KEY, token);
  else window.localStorage.removeItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(REFRESH_KEY, token);
  else window.localStorage.removeItem(REFRESH_KEY);
}

/** Remove both tokens (logout). */
export function clearTokens(): void {
  setToken(null);
  setRefreshToken(null);
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** JSON-serializable request body. Ignored when `formData` is set. */
  body?: unknown;
  /** Raw FormData body (for file uploads). Skips JSON serialization. */
  formData?: FormData;
  /** Set false to skip attaching the Authorization header. Default true. */
  auth?: boolean;
  /** Internal: prevents infinite refresh loops. */
  _retry?: boolean;
}

// Candado de concurrencia: si varias peticiones reciben 401 a la vez,
// comparten un ÚNICO refresh en curso en vez de dispararlo en paralelo
// (varios refresh simultáneos podían invalidarse entre sí y cerrar la sesión).
let refreshInFlight: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(`${API_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = (await res.json()) as { access: string; refresh?: string };
  setToken(data.access);
  // Con rotación (ROTATE_REFRESH_TOKENS) el backend emite un refresh nuevo y
  // blacklistea el anterior; hay que persistir el nuevo o el próximo refresh
  // fallaría.
  if (data.refresh) setRefreshToken(data.refresh);
  return data.access;
}

/** Try to obtain a new access token using the stored refresh token. */
function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/**
 * Perform a request against the API and parse the JSON response.
 *
 * @param path Path relative to `NEXT_PUBLIC_API_URL`, e.g. "/pacientes/".
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, formData, auth = true, headers, _retry, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (!formData && body !== undefined && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  // On 401, try one silent refresh + retry.
  if (response.status === 401 && auth && !_retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, { ...options, _retry: true });
    }
    // El refresh falló (sesión vencida/invalidada): mandar al login en vez
    // de dejar que la operación muestre un error genérico. Navegación dura a
    // propósito para descartar todo el estado en memoria de la sesión muerta.
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }
  }

  const text = await response.text();
  const data = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Request failed with status ${response.status}`,
      data,
    );
  }

  return data as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Convenience helpers. */
export const api = {
  get: <T>(path: string, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
