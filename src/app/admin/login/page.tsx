import { LoginForm } from "@/features/admin/presentation/login-form";
import { safeNextPath } from "@/core/auth/admin-gate";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(typeof params.next === "string" ? params.next : "/admin");
  const reason = typeof params.reason === "string" ? params.reason : "";
  return (
    <div className="tg-site">
      <div className="tg-wrap tg-section">
        <img src="/assets/logo/tribegreen-logo.png" alt="TribeGreen" style={{ height: 48 }} />
        <LoginForm nextPath={nextPath} reason={reason} />
      </div>
    </div>
  );
}
