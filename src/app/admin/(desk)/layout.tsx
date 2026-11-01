import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/features/admin/application/admin-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  if (session.forbidden || !session.admin) {
    return (
      <div className="tg-site">
        <div className="tg-wrap tg-section">
          <h1 className="tg-display">Admin access is unavailable</h1>
          <p className="tg-muted">{session.forbidden || "Sign in is required."}</p>
          <form action="/api/admin/session/end" method="get">
            <button className="tg-button" type="submit">
              Return to sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="tg-site">
      <header className="tg-header">
        <div className="tg-header-row">
          <Link href="/admin" className="tg-logo">
            <img src="/assets/logo/tribegreen-logo.png" alt="TribeGreen" />
          </Link>
          <nav className="tg-nav" aria-label="Admin" style={{ width: "auto", margin: 0 }}>
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/enquiries">Enquiries</Link>
          </nav>
          <form action="/api/admin/session/end" method="get" style={{ marginLeft: "auto" }}>
            <button className="tg-button-secondary" type="submit">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="tg-wrap tg-section">
        <p className="tg-muted">Signed in as {session.admin.name || session.admin.email}</p>
        {children}
      </main>
    </div>
  );
}
