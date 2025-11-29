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

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  // Dopasuj do istniejącego klienta/api.ts jeśli jest wspólny fetch.
  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await safeMessage(res);
    throw new Error(msg || "Rejestracja nie powiodła się");
  }
  return res.json();
}

async function safeMessage(res: Response) {
  try {
    const data = await res.json();
    return data?.message;
  } catch {
    return null;
  }
}
