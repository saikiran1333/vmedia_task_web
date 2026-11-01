const SECRET_KEY = /password|secret|token|authorization|database_url|connection/i;

function sanitize(meta?: Record<string, unknown>) {
  if (!meta) return "";
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    safe[key] = SECRET_KEY.test(key) ? "[redacted]" : value;
  }
  return ` | ${JSON.stringify(safe)}`;
}

export function debugLog(scope: string, message: string, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") return;
  const stamp = new Date().toISOString();
  console.debug(`[${stamp}] [DEBUG] [web] [${scope}] ${message}${sanitize(meta)}`);
}
