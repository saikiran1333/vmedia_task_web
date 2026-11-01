import { apiGet } from "@/core/network/api-client";
import { env } from "@/core/config/env";
import type { Hello } from "@/features/hello/domain/entities/hello";
import type { HelloRepository } from "@/features/hello/domain/repositories/hello-repository";

type HelloDto = {
  greeting?: string;
  platform?: string;
  environment?: string;
  serverTime?: string;
  uptimeSeconds?: number;
};

export class HelloRepositoryImpl implements HelloRepository {
  async getHello(): Promise<Hello> {
    const response = await apiGet<HelloDto>(`${env.apiPrefix}/hello`);
    const data = response.data ?? {};
    return {
      greeting: data.greeting ?? "Hello",
      platform: data.platform ?? "Vmedia",
      environment: data.environment ?? "unknown",
      serverTime: data.serverTime ?? new Date(0).toISOString(),
      uptimeSeconds: typeof data.uptimeSeconds === "number" ? data.uptimeSeconds : 0,
    };
  }
}
