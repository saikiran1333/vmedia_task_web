import { FailureBody, StatusCard } from "@/features/home/presentation/status-card";
import type { PanelState } from "@/features/home/domain/panel-state";
import type { Hello } from "@/features/hello/domain/entities/hello";

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export function HelloPanel({ state }: { state: PanelState<Hello> }) {
  if (state.status === "error") {
    return (
      <StatusCard kicker="Greeting" title="Hello is offline" tone="bad">
        <FailureBody title={state.title} detail={state.detail} action={state.action} />
      </StatusCard>
    );
  }

  const hello = state.data;
  return (
    <StatusCard kicker="Greeting" title={hello.greeting} tone="ok">
      <dl>
        <div>
          <dt>Platform</dt>
          <dd>{hello.platform}</dd>
        </div>
        <div>
          <dt>Environment</dt>
          <dd>{hello.environment}</dd>
        </div>
        <div>
          <dt>Server time</dt>
          <dd>{formatTime(hello.serverTime)}</dd>
        </div>
        <div>
          <dt>Uptime</dt>
          <dd>{hello.uptimeSeconds.toFixed(1)}s</dd>
        </div>
      </dl>
    </StatusCard>
  );
}
