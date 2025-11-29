import { api, authToken } from "./api";

export type User = {
  id: string;
  email: string;
  name?: string;
};

export type LoginResult = {
  ok?: boolean;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  message?: string;
};

export type AuthResponse = {
  ok: boolean;
  user?: User;
  message?: string;
};

export async function login(
  email: string,
  password: string,
  opts?: { remember?: boolean }
): Promise<LoginResult> {
  const result = await api.post<LoginResult>("auth/login", {
    email,
    password,
  });

  // Zapisz tokeny JWT po udanym logowaniu
  const token = result.accessToken || result.token;
  if (token) {
    authToken.set(token, opts?.remember);
    if (result.refreshToken) {
      authToken.setRefresh(result.refreshToken, opts?.remember);
    }
  }

  return result;
}

export async function logout(): Promise<{ ok: boolean }> {
  try {
    const result = await api.post<{ ok: boolean }>("auth/logout");
    return result;
  } finally {
    authToken.clear();
  }
}

export async function me(): Promise<AuthResponse> {
  return api.get<AuthResponse>("auth/me");
}

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<LoginResult> {
  const result = await api.post<LoginResult>("auth/register", {
    email,
    password,
    name,
  });

  // Opcjonalnie: automatyczne logowanie po rejestracji
  const token = result.accessToken || result.token;
  if (token) {
    authToken.set(token, false);
    if (result.refreshToken) {
      authToken.setRefresh(result.refreshToken, false);
    }
  }

  return result;
}

export function isAuthenticated(): boolean {
  return !!authToken.get();
}

export function getAuthToken(): string | null {
  return authToken.get();
}
