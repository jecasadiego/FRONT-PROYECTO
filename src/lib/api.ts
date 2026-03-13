import type { ApiEnvelope } from "../types";

type QueryValue = string | number | boolean | null | undefined;

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:3000/api/v1";

export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  details: string[];

  constructor(message: string, status: number, details: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const buildUrl = (path: string, query?: Record<string, QueryValue>) => {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  query?: Record<string, QueryValue>,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path, query), {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String(payload.message)
        : "No fue posible completar la solicitud";
    const details =
      payload && typeof payload === "object" && "details" in payload && Array.isArray(payload.details)
        ? payload.details.map((detail: unknown) => String(detail))
        : [];

    throw new ApiError(message, response.status, details);
  }

  return payload as T;
}

export const api = {
  get<T>(path: string, query?: Record<string, QueryValue>) {
    return request<ApiEnvelope<T>>(path, { method: "GET" }, query).then((payload) => payload.data);
  },
  getRaw<T>(path: string, query?: Record<string, QueryValue>) {
    return request<T>(path, { method: "GET" }, query);
  },
  post<T>(path: string, body: Record<string, unknown>) {
    return request<ApiEnvelope<T>>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((payload) => payload.data);
  },
  put<T>(path: string, body: Record<string, unknown>) {
    return request<ApiEnvelope<T>>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }).then((payload) => payload.data);
  },
  delete(path: string) {
    return request<void>(path, { method: "DELETE" });
  },
};
