function required(name: string, fallback: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

function backendUrl() {
  const value = required("BACKEND_URL", "http://127.0.0.1:5000").replace(/\/$/, "");
  // On Windows, "localhost" can resolve to IPv6 while the API is on IPv4, which fails the login POST.
  return value.replace("://localhost", "://127.0.0.1");
}

export const env = {
  backendUrl: backendUrl(),
  apiPrefix: required("API_PREFIX", "/api/v1"),
  requestTimeoutMs: 8000,
};
