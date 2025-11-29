import { api, authToken } from "./api";

export type User = {
  id: string;
  email: string;
  name?: string;
};

export type LoginResult = {
  ok?: boolean;
  token?: string;
  access_token?: string;
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
  const result = await api.post<LoginResult>("/auth/login", {
    email,
    password,
  });

  console.log("API login result:", result);
  console.log("Remember option:", opts?.remember);

  const token = result.access_token || result.token;
  console.log("Extracted token:", token ? "token exists" : "no token");

  if (token) {
    authToken.set(token, opts?.remember);
    console.log("Token saved, verifying:", authToken.get() ? "success" : "failed");
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

  const token = result.access_token || result.token;
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

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
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
