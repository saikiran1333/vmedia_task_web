import { getHealth } from "@/features/health/application/get-health";
import { getHello } from "@/features/hello/application/get-hello";
import { HomeScreen } from "@/features/home/presentation/home-screen";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [hello, health] = await Promise.all([getHello(), getHealth()]);
  return <HomeScreen hello={hello} health={health} />;
}
