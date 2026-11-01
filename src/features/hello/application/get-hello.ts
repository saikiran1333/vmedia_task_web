import { describeFailure } from "../../../core/errors/api-error";
import { debugLog } from "../../../core/logging/debug-log";
import type { Hello } from "../domain/entities/hello";
import type { HelloRepository } from "../domain/repositories/hello-repository";
import type { PanelState } from "../../home/domain/panel-state";

export async function getHello(repository?: HelloRepository): Promise<PanelState<Hello>> {
  const repo = repository ?? (await import("../../../core/composition/container")).helloRepository;
  try {
    const data = await repo.getHello();
    if (!data.greeting.trim()) {
      debugLog("hello", "empty greeting");
      return {
        status: "error",
        title: "No greeting yet",
        detail: "The backend responded without a greeting.",
        action: "Check the hello route logs, then press Check again.",
      };
    }
    debugLog("hello", "ready", { platform: data.platform, environment: data.environment });
    return { status: "ready", data };
  } catch (error) {
    const failure = describeFailure(error);
    debugLog("hello", "failed", { title: failure.title });
    return { status: "error", ...failure };
  }
}
