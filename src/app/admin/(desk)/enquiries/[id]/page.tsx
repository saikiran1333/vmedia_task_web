import Link from "next/link";
import { getAdminEnquiry, requireAdmin } from "@/features/admin/application/admin-session";
import { STATUS_LABELS, isEnquiryStatus } from "@/features/admin/domain/enquiry-query";
import { formatRupees, formatWhen } from "@/features/catalog/domain/entities/product";
import { StatusControl } from "@/features/admin/presentation/admin-controls";
import { StateMessage } from "@/features/catalog/presentation/state-message";

export const dynamic = "force-dynamic";

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;
  if (!session.token || session.forbidden) return null;
  const state = await getAdminEnquiry(session.token, id);
  if (state.status === "error") {
    return (
      <div>
        <StateMessage {...state} />
        <p>
          <Link href="/admin/enquiries">Back to enquiries</Link>
        </p>
      </div>
    );
  }
  const enquiry = state.data;
  const statusLabel = isEnquiryStatus(enquiry.status) ? STATUS_LABELS[enquiry.status] : enquiry.status;
  return (
    <div>
      <p>
        <Link href="/admin/enquiries">All enquiries</Link>
      </p>
      <h1 className="tg-display">{enquiry.enquiryNumber}</h1>
      <p className="tg-status">{statusLabel}</p>
      <StatusControl id={enquiry.id} status={enquiry.status} />
      <div className="tg-benefit-grid" style={{ marginTop: 16 }}>
        <article className="tg-panel" style={{ padding: 16 }}>
          <h2>Customer</h2>
          <p>{enquiry.name}</p>
          <p>{enquiry.companyName || "No company"}</p>
          <p>{enquiry.email}</p>
          <p>{enquiry.phone}</p>
          <p>{enquiry.city}</p>
        </article>
        <article className="tg-panel" style={{ padding: 16 }}>
          <h2>Brief</h2>
          <p>Occasion: {enquiry.occasion}</p>
          <p>Budget: {enquiry.budget}</p>
          <p>Units: {enquiry.units}</p>
          <p>Source: {enquiry.source}</p>
          <p>Delivery: {enquiry.deliveryDate || "Not requested"}</p>
          <p>Created {formatWhen(enquiry.createdAt)}</p>
          <p>Updated {formatWhen(enquiry.updatedAt)}</p>
        </article>
      </div>
      <section className="tg-section">
        <h2 className="tg-title">Message</h2>
        <p>{enquiry.message || "No message"}</p>
        <h2 className="tg-title">Customisation</h2>
        <p>{enquiry.customisationOptions.length ? enquiry.customisationOptions.join(", ") : "None selected"}</p>
        <p>{enquiry.customisationRequirements || "No extra customisation note."}</p>
      </section>
      <section>
        <h2 className="tg-title">Products</h2>
        {enquiry.items.length === 0 ? <p className="tg-muted">No products were attached.</p> : null}
        {enquiry.items.length > 0 ? (
          <ul>
            {enquiry.items.map((item) => (
              <li key={item.productId}>
                {item.productName} ({item.productId}) × {item.quantity}
                {item.unitPrice != null ? ` · ${formatRupees(item.unitPrice)}` : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
      <section className="tg-section">
        <h2 className="tg-title">Status history</h2>
        {enquiry.statusEvents.length === 0 ? <p className="tg-muted">No status changes are recorded.</p> : null}
        <ul>
          {enquiry.statusEvents.map((event) => (
            <li key={`${event.createdAt}-${event.toStatus}`}>
              {event.fromStatus || "Start"} to {event.toStatus} · {formatWhen(event.createdAt)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
