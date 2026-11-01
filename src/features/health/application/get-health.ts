import { describeFailure } from "../../../core/errors/api-error";
import { debugLog } from "../../../core/logging/debug-log";
import type { HealthSnapshot } from "../domain/entities/health";
import type { HealthRepository } from "../domain/repositories/health-repository";
import type { PanelState } from "../../home/domain/panel-state";

export async function getHealth(repository?: HealthRepository): Promise<PanelState<HealthSnapshot>> {
  const repo = repository ?? (await import("../../../core/composition/container")).healthRepository;
  try {
    const data = await repo.getHealth();
    if (!data.database.connected) {
      debugLog("health", "database disconnected", { provider: data.database.provider });
      return {
        status: "error",
        title: "Database unavailable",
        detail: data.database.error ?? "Neon Postgres did not answer.",
        action: "Check DATABASE_URL in the backend .env and that the Neon project is active.",
      };
    }
    debugLog("health", "ready", { provider: data.database.provider, latencyMs: data.database.latencyMs });
    return { status: "ready", data };
  } catch (error) {
    const failure = describeFailure(error);
    debugLog("health", "failed", { title: failure.title });
    return { status: "error", ...failure };
  }
}
