import { env } from "@/core/config/env";
import { ApiError } from "@/core/errors/api-error";
import { debugLog } from "@/core/logging/debug-log";

type Envelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export async function apiGet<T>(path: string): Promise<Envelope<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.requestTimeoutMs);
  const url = `${env.backendUrl}${path}`;
  debugLog("http", "request", { method: "GET", path });

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    const text = await response.text();
    let body: Envelope<T> | null = null;
    try {
      body = text ? (JSON.parse(text) as Envelope<T>) : null;
    } catch {
      throw new ApiError("Backend returned a response that was not JSON.", "parse", response.status);
    }

    if (!response.ok || !body?.success) {
      debugLog("http", "http failure", { path, statusCode: response.status });
      throw new ApiError(body?.message || `Request failed with status ${response.status}.`, "http", response.status);
    }

    debugLog("http", "response", { path, statusCode: response.status });
    return body;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.kind === "parse") debugLog("http", "non-json response", { path, statusCode: error.statusCode });
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      debugLog("http", "timeout", { path, timeoutMs: env.requestTimeoutMs });
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
