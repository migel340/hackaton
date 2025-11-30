import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
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

// ---------- Axios Instance ----------
const axiosInstance: AxiosInstance = axios.create({
  baseURL: "/local/api/v1",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ---------- Response Interceptor (konwertuje błędy na ApiError) ----------
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
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
export type ApiRequestOptions = Omit<AxiosRequestConfig, "url" | "method" | "data">;

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiRequestOptions & { method?: string; data?: unknown } = {}
): Promise<T> {
  const response = await axiosInstance.request<T>({
    url: path,
    ...options,
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
