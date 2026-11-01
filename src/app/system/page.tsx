import type { Metadata } from "next";
import { getHealth } from "@/features/health/application/get-health";
import { getHello } from "@/features/hello/application/get-hello";
import { HomeScreen } from "@/features/home/presentation/home-screen";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "System status",
  robots: { index: false, follow: false },
};

export default async function SystemPage() {
  const [hello, health] = await Promise.all([getHello(), getHealth()]);
  return (
    <div className="system-shell">
      <HomeScreen hello={hello} health={health} />
    </div>
  );
}
