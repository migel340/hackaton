import { api } from "./api";

export type LoginResult = {
  ok?: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  message?: string;
};

export async function login(
  email: string,
  password: string,
  opts?: { remember?: boolean }
): Promise<LoginResult> {
  // Zakładamy endpoint POST /api/auth/login oraz cookies (credentials: include)
  const result = await api.post<LoginResult>("auth/login", {
    email,
    password,
    remember: !!opts?.remember,
  });
  return result;
}

export async function logout(): Promise<{ ok: boolean }> {
  return api.post<{ ok: boolean }>("auth/logout");
}

export async function me(): Promise<{
  ok: boolean;
  user?: LoginResult["user"];
}> {
  return api.get<{ ok: boolean; user?: LoginResult["user"] }>("auth/me");
}
