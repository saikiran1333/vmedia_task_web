import { env } from "@/core/config/env";
import { ApiError, type FieldError } from "@/core/errors/api-error";
import { debugLog } from "@/core/logging/debug-log";

export type Envelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: { page?: number; pageSize?: number; total?: number } | null;
  errors?: { field?: string; message?: string }[] | null;
  timestamp?: string;
};

type Method = "GET" | "POST" | "PATCH";

type RequestOptions = {
  method?: Method;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

function fieldErrors(errors: Envelope<unknown>["errors"]): FieldError[] {
  if (!Array.isArray(errors)) return [];
  return errors
    .filter((item) => item && typeof item.message === "string")
    .map((item) => ({
      field: typeof item.field === "string" ? item.field : "form",
      message: item.message as string,
    }));
}

async function parseJson(response: Response, path: string): Promise<Envelope<unknown> | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as Envelope<unknown>;
  } catch {
    debugLog("http", "non-json response", { path, statusCode: response.status });
    throw new ApiError("Backend returned a response that was not JSON.", "parse", response.status);
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<Envelope<T>> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? env.requestTimeoutMs;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const method = options.method ?? "GET";
  const url = `${env.backendUrl}${path}`;
  debugLog("http", "request", { method, path });

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  try {
    const response = await fetch(url, {
      method,
      cache: "no-store",
      signal: controller.signal,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const body = (await parseJson(response, path)) as Envelope<T> | null;
    if (!response.ok || !body?.success) {
      debugLog("http", "http failure", { path, statusCode: response.status });
      throw new ApiError(
        body?.message || `Request failed with status ${response.status}.`,
        "http",
        response.status,
        fieldErrors(body?.errors),
      );
    }

    debugLog("http", "response", { path, statusCode: response.status });
    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      debugLog("http", "timeout", { path, timeoutMs });
      throw new ApiError("The backend did not respond within 8 seconds.", "timeout");
    }
    debugLog("http", "network failure", { path });
    throw new ApiError(
      "The backend could not be reached. Start it on port 5000 and try again.",
      "network",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export function apiGet<T>(path: string, headers?: Record<string, string>, timeoutMs?: number) {
  return apiRequest<T>(path, { headers, timeoutMs });
}

export function apiSend<T>(
  path: string,
  method: "POST" | "PATCH",
  body: unknown,
  headers?: Record<string, string>,
  timeoutMs?: number,
) {
  return apiRequest<T>(path, { method, body, headers, timeoutMs });
}

export type RawResponse = {
  status: number;
  contentType: string;
  body: string;
  header(name: string): string | null;
};

export async function apiGetRaw(path: string, headers?: Record<string, string>, timeoutMs?: number): Promise<RawResponse> {
  const controller = new AbortController();
  const limit = timeoutMs ?? env.requestTimeoutMs;
  const timeout = setTimeout(() => controller.abort(), limit);
  const url = `${env.backendUrl}${path}`;
  debugLog("http", "request", { method: "GET", path });

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "text/csv, application/json", ...headers },
    });
    const body = await response.text();
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json") || !response.ok) {
      let parsed: Envelope<unknown> | null = null;
      try {
        parsed = body ? (JSON.parse(body) as Envelope<unknown>) : null;
      } catch {
        throw new ApiError("Backend returned a response that was not JSON.", "parse", response.status);
      }
      throw new ApiError(
        parsed?.message || `Request failed with status ${response.status}.`,
        "http",
        response.status,
        fieldErrors(parsed?.errors),
      );
    }
    debugLog("http", "response", { path, statusCode: response.status });
    return {
      status: response.status,
      contentType,
      body,
      header: (name: string) => response.headers.get(name),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("The backend did not respond within 8 seconds.", "timeout");
    }
    throw new ApiError(
      "The backend could not be reached. Start it on port 5000 and try again.",
      "network",
    );
  } finally {
    clearTimeout(timeout);
  }
}
