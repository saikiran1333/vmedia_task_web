import { env } from "@/core/config/env";
import { apiGet } from "@/core/network/api-client";
import type { HealthSnapshot } from "@/features/health/domain/entities/health";
import type { HealthRepository } from "@/features/health/domain/repositories/health-repository";

type HealthDto = {
  status?: string;
  uptime?: number;
  timestamp?: string;
  services?: {
    database?: {
      provider?: string;
      connected?: boolean;
      database?: string | null;
      latencyMs?: number | null;
      error?: string | null;
    };
  };
  system?: { nodeVersion?: string };
};

export class HealthRepositoryImpl implements HealthRepository {
  async getHealth(): Promise<HealthSnapshot> {
    const response = await apiGet<HealthDto>(`${env.apiPrefix}/health`);
    const data = response.data;
    const database = data?.services?.database;
    return {
      status: data?.status === "UP" ? "UP" : "DEGRADED",
      uptime: typeof data?.uptime === "number" ? data.uptime : 0,
      timestamp: data?.timestamp ?? new Date(0).toISOString(),
      database: {
        provider: database?.provider ?? "Neon Postgres",
        connected: Boolean(database?.connected),
        database: database?.database ?? null,
        latencyMs: typeof database?.latencyMs === "number" ? database.latencyMs : null,
        error: database?.error ?? null,
      },
      nodeVersion: data?.system?.nodeVersion ?? "unknown",
    };
  }
}
