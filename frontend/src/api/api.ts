import axios from "axios";

// Klient API z JWT (Bearer), auto-refresh po 401 i retry.
export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type ApiRequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
  auth?: boolean;
  retryOn401?: boolean;
};

// Konfiguracja bazowego URL
const API_BASE =
  (typeof import.meta !== "undefined" &&
    (import.meta as any)?.env?.VITE_API_BASE) ||
  "/api";

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = String(API_BASE).replace(/\/$/, "");
  const p = String(path).replace(/^\//, "");
  return `${base}/${p}`;
}

// ---------- Token storage ----------
const TOKEN_KEY_LOCAL = "auth_token";
const TOKEN_KEY_SESSION = "auth_token";
let tokenPersist: "local" | "session" | null = null;

function getStoredToken(): string | null {
  return (
    localStorage.getItem(TOKEN_KEY_LOCAL) ||
    sessionStorage.getItem(TOKEN_KEY_SESSION) ||
    null
  );
}

function setStoredToken(token: string, remember?: boolean) {
  tokenPersist = remember ? "local" : "session";
  if (remember) {
    localStorage.setItem(TOKEN_KEY_LOCAL, token);
    sessionStorage.removeItem(TOKEN_KEY_SESSION);
  } else {
    sessionStorage.setItem(TOKEN_KEY_SESSION, token);
    localStorage.removeItem(TOKEN_KEY_LOCAL);
  }
}

function overwriteStoredToken(token: string) {
  // użyj tego samego trybu pamięci co poprzednio
  const remember = tokenPersist === "local";
  setStoredToken(token, remember);
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY_LOCAL);
  sessionStorage.removeItem(TOKEN_KEY_SESSION);
  tokenPersist = null;
}

export const authToken = {
  get: getStoredToken,
  set: setStoredToken,
  clear: clearStoredToken,
};

// ---------- Refresh handling ----------
let refreshPromise: Promise<string | null> | null = null;

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text || null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  // Założenie: backend udostępnia POST /auth/refresh i zwraca { token } lub { accessToken }
  const url = buildUrl("auth/refresh");
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) return null;

  const token = (data && (data.accessToken || data.token)) || null;
  if (token) overwriteStoredToken(token);
  return token;
}

async function ensureRefreshed(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ---------- Request core ----------
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const url = buildUrl(path);

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  let body = options.body;

  // JSON body
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    body = typeof body === "string" ? body : JSON.stringify(body);
  }

  // Bearer token
  const useAuth = options.auth !== false;
  if (useAuth) {
    const token = getStoredToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body,
    credentials: options.credentials ?? "include",
    signal: options.signal,
  });

  // Obsługa 401 -> refresh -> retry (jeden raz)
  const allowRetry = options.retryOn401 ?? true;
  if (res.status === 401 && allowRetry && useAuth) {
    const newToken = await ensureRefreshed();
    if (newToken) {
      // ponowne wywołanie z nowym tokenem
      const retriedHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      const retryRes = await fetch(url, {
        method: options.method || "GET",
        headers: retriedHeaders,
        body,
        credentials: options.credentials ?? "include",
        signal: options.signal,
      });
      const retryData = await parseJsonSafe(retryRes);
      if (!retryRes.ok) {
        const message =
          (retryData && (retryData.message || retryData.error)) ||
          `Request failed with status ${retryRes.status}`;
        throw new ApiError(String(message), retryRes.status, retryData);
      }
      return retryData as T;
    }
  }

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(String(message), res.status, data);
  }

  return data as T;
}

export const api = {
  get<T = unknown>(path: string, opts?: ApiRequestOptions) {
    return apiFetch<T>(path, { ...(opts || {}), method: "GET" });
  },
  post<T = unknown>(path: string, body?: any, opts?: ApiRequestOptions) {
    return apiFetch<T>(path, { ...(opts || {}), method: "POST", body });
  },
  put<T = unknown>(path: string, body?: any, opts?: ApiRequestOptions) {
    return apiFetch<T>(path, { ...(opts || {}), method: "PUT", body });
  },
  del<T = unknown>(path: string, opts?: ApiRequestOptions) {
    return apiFetch<T>(path, { ...(opts || {}), method: "DELETE" });
  },
};
