export type HealthSnapshot = {
  status: "UP" | "DEGRADED";
  uptime: number;
  timestamp: string;
  database: {
    provider: string;
    connected: boolean;
    database: string | null;
    latencyMs: number | null;
    error: string | null;
  };
  nodeVersion: string;
};
