import Link from "next/link";
import { loadStatusCounts, requireAdmin } from "@/features/admin/application/admin-session";
import { STATUS_LABELS } from "@/features/admin/domain/enquiry-query";
import { StateMessage } from "@/features/catalog/presentation/state-message";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const session = await requireAdmin();
  if (!session.token || session.forbidden) return null;
  const counts = await loadStatusCounts(session.token);
  return (
    <div>
      <h1 className="tg-display">Dashboard</h1>
      {counts.status === "error" ? <StateMessage {...counts} /> : null}
      {counts.status === "ready" ? (
        <div className="tg-metrics">
          <Link className="tg-metric" href="/admin/enquiries">
            <span>Total enquiries</span>
            <strong>{counts.data.total}</strong>
          </Link>
          {(["NEW", "CONTACTED", "CONVERTED", "LOST"] as const).map((status) => (
            <Link key={status} className="tg-metric" href={`/admin/enquiries?status=${status}`}>
              <span>{STATUS_LABELS[status]}</span>
              <strong>{counts.data[status]}</strong>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
