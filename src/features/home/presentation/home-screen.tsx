import { HealthPanel } from "@/features/health/presentation/health-panel";
import { HelloPanel } from "@/features/hello/presentation/hello-panel";
import type { HealthSnapshot } from "@/features/health/domain/entities/health";
import type { Hello } from "@/features/hello/domain/entities/hello";
import type { PanelState } from "@/features/home/domain/panel-state";
import { RefreshButton } from "@/features/home/presentation/refresh-button";

export function HomeScreen({
  hello,
  health,
}: {
  hello: PanelState<Hello>;
  health: PanelState<HealthSnapshot>;
}) {
  return (
    <main>
      <header className="top">
        <p className="mark">Vmedia</p>
        <p className="quiet">Task platform</p>
      </header>

      <section className="hero">
        <p className="eyebrow">Live system</p>
        <h1>The web reads the API. The API reads Neon.</h1>
        <p className="lede">
          This page is the composition root for the web client. It asks the Vmedia backend for a greeting
          and a database health check, then renders a clear result or the exact next step when something fails.
        </p>
        <RefreshButton />
      </section>

      <section className="grid" aria-live="polite">
        <HelloPanel state={hello} />
        <HealthPanel state={health} />
      </section>
    </main>
  );
}
