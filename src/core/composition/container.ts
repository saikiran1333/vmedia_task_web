import { HealthRepositoryImpl } from "@/features/health/data/health-repository-impl";
import { HelloRepositoryImpl } from "@/features/hello/data/hello-repository-impl";

export const helloRepository = new HelloRepositoryImpl();
export const healthRepository = new HealthRepositoryImpl();
