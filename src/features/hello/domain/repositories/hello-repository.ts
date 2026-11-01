import type { Hello } from "@/features/hello/domain/entities/hello";

export interface HelloRepository {
  getHello(): Promise<Hello>;
}
