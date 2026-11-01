function required(name: string, fallback: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  backendUrl: required("BACKEND_URL", "http://localhost:5000").replace(/\/$/, ""),
  apiPrefix: required("API_PREFIX", "/api/v1"),
  requestTimeoutMs: 8000,
};
