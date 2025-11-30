import { api } from "./api";

export type User = {
  id: string;
  email: string;
  name?: string;
};

export type LoginResult = {
  ok?: boolean;
  token?: string;
  access_token?: string;
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
  password: string
): Promise<LoginResult> {
  const result = await api.post<LoginResult>("/auth/login", {
    email,
    password,
  });

  if (result.access_token) {
    localStorage.setItem("auth_token", result.access_token);
  }

  return result;
}

export async function logout(): Promise<{ ok: boolean }> {
  return api.post<{ ok: boolean }>("auth/logout");
}

export async function me(): Promise<AuthResponse> {
  return api.get<AuthResponse>("auth/me");
}

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<LoginResult> {
  return api.post<LoginResult>("auth/register", {
    email,
    password,
    name,
  });
}
