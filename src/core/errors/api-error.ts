export type ApiErrorKind = "network" | "timeout" | "http" | "parse";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly statusCode?: number;

  constructor(message: string, kind: ApiErrorKind, statusCode?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.statusCode = statusCode;
  }
}

export function describeFailure(error: unknown): { title: string; detail: string; action: string } {
  if (error instanceof ApiError) {
    if (error.kind === "timeout") {
      return {
        title: "The backend took too long",
        detail: error.message,
        action: "Confirm the API on port 5000 is running, then refresh.",
      };
    }
    if (error.kind === "network") {
      return {
        title: "Backend unreachable",
        detail: error.message,
        action: "From vmedia_task_backend, run npm run dev, then refresh this page.",
      };
    }
    if (error.kind === "parse") {
      return {
        title: "Unexpected response",
        detail: error.message,
        action: "Check the API process logs. The web app only accepts the JSON envelope.",
      };
    }
    if (error.statusCode === 503) {
      return {
        title: "Database unavailable",
        detail: error.message,
        action: "Check DATABASE_URL in the backend .env and that the Neon project is active.",
      };
    }
    return {
      title: "Request failed",
      detail: error.message,
      action: "Retry. If it continues, read the matching route in the backend logs.",
    };
  }

  return {
    title: "Something went wrong",
    detail: error instanceof Error ? error.message : "Unknown error",
    action: "Refresh the page. If it persists, check the web and backend terminals.",
  };
}
