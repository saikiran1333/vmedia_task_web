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
    <div className="tg-site tg-login-page">
      <div className="tg-login-card">
        <img src="/assets/logo/tribegreen-logo.png" alt="TribeGreen" className="tg-login-logo" />
        <LoginForm nextPath={nextPath} reason={reason} />
      </div>
    </div>
  );
}
