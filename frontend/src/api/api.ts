import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

// ---------- Custom Error ----------
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

// ---------- Konfiguracja bazowego URL ----------
const API_BASE =
  (typeof import.meta !== "undefined" &&
    (import.meta as any)?.env?.VITE_API_BASE) ||
  "/api";

// ---------- Token storage ----------
const TOKEN_KEY_LOCAL = "auth_token";
const TOKEN_KEY_SESSION = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
let tokenPersist: "local" | "session" | null = null;

function getStoredToken(): string | null {
  return (
    localStorage.getItem(TOKEN_KEY_LOCAL) ||
    sessionStorage.getItem(TOKEN_KEY_SESSION) ||
    null
  );
}

function getStoredRefreshToken(): string | null {
  return (
    localStorage.getItem(REFRESH_TOKEN_KEY) ||
    sessionStorage.getItem(REFRESH_TOKEN_KEY) ||
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

function setStoredRefreshToken(token: string, remember?: boolean) {
  if (remember) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } else {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

function overwriteStoredToken(token: string) {
  const remember = tokenPersist === "local";
  setStoredToken(token, remember);
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY_LOCAL);
  sessionStorage.removeItem(TOKEN_KEY_SESSION);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  tokenPersist = null;
}

export const authToken = {
  get: getStoredToken,
  set: setStoredToken,
  setRefresh: setStoredRefreshToken,
  getRefresh: getStoredRefreshToken,
  clear: clearStoredToken,
};

// ---------- Axios Instance ----------
const axiosInstance: AxiosInstance = axios.create({
<<<<<<< HEAD
  baseURL: "/local/api/v1",
=======
  baseURL: API_BASE,
>>>>>>> 9f5e3f277cd0c8070cecf85ac21996cb6a512e45
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ---------- Request Interceptor (dodaje token JWT) ----------
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

<<<<<<< HEAD
=======
// ---------- Refresh handling ----------
>>>>>>> 9f5e3f277cd0c8070cecf85ac21996cb6a512e45
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = getStoredRefreshToken();
    const response = await axios.post(
      `${API_BASE}/auth/refresh`,
      { refreshToken },
      { withCredentials: true }
    );

    const data = response.data;
    const newToken = data?.accessToken || data?.token || null;
    const newRefreshToken = data?.refreshToken;

    if (newToken) {
      overwriteStoredToken(newToken);
      if (newRefreshToken) {
        setStoredRefreshToken(newRefreshToken, tokenPersist === "local");
      }
    }

    return newToken;
  } catch {
    clearStoredToken();
    return null;
  }
}

// ---------- Response Interceptor (obsługa 401 i auto-refresh) ----------
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Jeśli 401 i nie jest to retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Czekaj na zakończenie odświeżania
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          processQueue(null, newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axiosInstance(originalRequest);
        } else {
          processQueue(new Error("Refresh token failed"), null);
          // Przekieruj do logowania lub wyczyść stan
          clearStoredToken();
          window.location.href = "/login";
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearStoredToken();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Konwertuj błąd axios na ApiError
    const status = error.response?.status || 500;
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message =
      (data?.message as string) ||
      (data?.error as string) ||
      error.message ||
      `Request failed with status ${status}`;

    return Promise.reject(new ApiError(message, status, data));
  }
);

// ---------- API methods ----------
export interface ApiRequestOptions extends Omit<AxiosRequestConfig, "auth"> {
  auth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { auth = true, ...axiosOptions } = options;

  // Jeśli auth jest false, usuń token z tego requestu
  if (!auth && axiosOptions.headers) {
    delete (axiosOptions.headers as Record<string, unknown>)["Authorization"];
  }

  const response = await axiosInstance.request<T>({
    url: path,
    ...axiosOptions,
  });

  return response.data;
}

export const api = {
  get<T = unknown>(path: string, opts?: ApiRequestOptions) {
    return apiFetch<T>(path, { ...opts, method: "GET" });
  },
  post<T = unknown>(path: string, body?: unknown, opts?: ApiRequestOptions) {
    return apiFetch<T>(path, { ...opts, method: "POST", data: body });
  },
  put<T = unknown>(path: string, body?: unknown, opts?: ApiRequestOptions) {
    return apiFetch<T>(path, { ...opts, method: "PUT", data: body });
  },
  patch<T = unknown>(path: string, body?: unknown, opts?: ApiRequestOptions) {
    return apiFetch<T>(path, { ...opts, method: "PATCH", data: body });
  },
  del<T = unknown>(path: string, opts?: ApiRequestOptions) {
    return apiFetch<T>(path, { ...opts, method: "DELETE" });
  },
};

// Eksport instancji axios dla zaawansowanych przypadków
export { axiosInstance };
