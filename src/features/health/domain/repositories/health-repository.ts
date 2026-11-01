import type { HealthSnapshot } from "@/features/health/domain/entities/health";

export interface HealthRepository {
  getHealth(): Promise<HealthSnapshot>;
}
