import { FailureBody, StatusCard } from "@/features/home/presentation/status-card";
import type { HealthSnapshot } from "@/features/health/domain/entities/health";
import type { PanelState } from "@/features/home/domain/panel-state";

export function HealthPanel({ state }: { state: PanelState<HealthSnapshot> }) {
  if (state.status === "error") {
    return (
      <StatusCard kicker="Health" title="Dependency check failed" tone="bad">
        <FailureBody title={state.title} detail={state.detail} action={state.action} />
      </StatusCard>
    );
  }

  const health = state.data;
  const healthy = health.status === "UP" && health.database.connected;
  return (
    <StatusCard kicker="Health" title={healthy ? "Neon Postgres is connected" : "Service degraded"} tone={healthy ? "ok" : "bad"}>
      <dl>
        <div>
          <dt>Provider</dt>
          <dd>{health.database.provider}</dd>
        </div>
        <div>
          <dt>Database</dt>
          <dd>{health.database.database ?? "Unknown"}</dd>
        </div>
        <div>
          <dt>Latency</dt>
          <dd>{health.database.latencyMs === null ? "n/a" : `${health.database.latencyMs} ms`}</dd>
        </div>
        <div>
          <dt>Runtime</dt>
          <dd>{health.nodeVersion}</dd>
        </div>
      </dl>
      {health.database.error ? <p className="action">{health.database.error}</p> : null}
    </StatusCard>
  );
}
