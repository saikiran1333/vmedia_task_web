import Link from "next/link";
import { listAdminEnquiries, requireAdmin } from "@/features/admin/application/admin-session";
import { listOccasions } from "@/features/catalog/application/get-catalog";
import {
  ENQUIRY_STATUSES,
  STATUS_LABELS,
  enquirySearchParams,
  parseEnquirySearchParams,
  type EnquiryFilters,
} from "@/features/admin/domain/enquiry-query";
import { formatWhen } from "@/features/catalog/domain/entities/product";
import { ExportButton } from "@/features/admin/presentation/admin-controls";
import { StateMessage } from "@/features/catalog/presentation/state-message";

export const dynamic = "force-dynamic";

function pageHref(filters: EnquiryFilters, page: number) {
  const params = enquirySearchParams({ ...filters, page }, { paginate: true });
  const query = params.toString();
  return query ? `/admin/enquiries?${query}` : "/admin/enquiries";
}

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdmin();
  const filters = parseEnquirySearchParams(await searchParams);
  if (!session.token || session.forbidden) return null;
  const [list, occasions] = await Promise.all([listAdminEnquiries(session.token, filters), listOccasions()]);
  const occasionOptions = occasions.status === "ready" ? occasions.data : [];

  return (
    <div>
      <div className="tg-row" style={{ justifyContent: "space-between" }}>
        <h1 className="tg-display">Enquiries</h1>
        <ExportButton filters={filters} />
      </div>
      <form className="tg-filters" action="/admin/enquiries" method="get">
        <label className="tg-field">
          Search
          <input name="q" defaultValue={filters.q} maxLength={80} />
        </label>
        <label className="tg-field">
          Status
          <select name="status" defaultValue={filters.status}>
            <option value="">Any status</option>
            {ENQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="tg-field">
          Source
          <select name="source" defaultValue={filters.source}>
            <option value="">Any source</option>
            <option value="WEBSITE">Website</option>
            <option value="MOBILE">Mobile</option>
          </select>
        </label>
        <label className="tg-field">
          Occasion
          <select name="occasion" defaultValue={filters.occasion}>
            <option value="">Any occasion</option>
            {occasionOptions.map((occasion) => (
              <option key={occasion.enquiryLabel} value={occasion.enquiryLabel}>
                {occasion.enquiryLabel}
              </option>
            ))}
          </select>
        </label>
        <label className="tg-field">
          From
          <input name="from" type="date" defaultValue={filters.from} />
        </label>
        <label className="tg-field">
          To
          <input name="to" type="date" defaultValue={filters.to} />
        </label>
        <button className="tg-button" type="submit">
          Apply filters
        </button>
        <Link className="tg-button-secondary" href="/admin/enquiries">
          Clear filters
        </Link>
      </form>
      {list.status === "error" ? <StateMessage {...list} /> : null}
      {list.status === "ready" && list.data.total === 0 ? (
        <div className="tg-alert">
          <h2 className="tg-title">No enquiries match</h2>
          <p className="tg-muted">Adjust the filters or wait for a new website enquiry.</p>
        </div>
      ) : null}
      {list.status === "ready" && list.data.total > 0 ? (
        <>
          <p className="tg-muted">{list.data.total} enquiries</p>
          <div className="tg-cards">
            {list.data.items.map((item) => (
              <article key={item.id} className="tg-data-card">
                <Link href={`/admin/enquiries/${item.id}`}>{item.enquiryNumber}</Link>
                <span>{item.name}</span>
                <span>{item.companyName || "No company"}</span>
                <span>{item.email}</span>
                <span>{item.phone}</span>
                <span>{item.city}</span>
                <span>{item.occasion}</span>
                <span>{item.units} gifts</span>
                <span>{item.budget}</span>
                <span>{item.source}</span>
                <span className="tg-status">{item.status}</span>
                <span>{formatWhen(item.createdAt)}</span>
              </article>
            ))}
          </div>
          <div className="tg-table-wrap">
            <table className="tg-admin-table">
              <thead>
                <tr>
                  {[
                    "Enquiry",
                    "Name",
                    "Company",
                    "Email",
                    "Phone",
                    "City",
                    "Occasion",
                    "Units",
                    "Budget",
                    "Source",
                    "Status",
                    "Created",
                  ].map((heading) => (
                    <th key={heading} scope="col">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.data.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link href={`/admin/enquiries/${item.id}`}>{item.enquiryNumber}</Link>
                    </td>
                    <td>{item.name}</td>
                    <td>{item.companyName || "No company"}</td>
                    <td>{item.email}</td>
                    <td>{item.phone}</td>
                    <td>{item.city}</td>
                    <td>{item.occasion}</td>
                    <td>{item.units}</td>
                    <td>{item.budget}</td>
                    <td>{item.source}</td>
                    <td>
                      <span className="tg-status">{item.status}</span>
                    </td>
                    <td>{formatWhen(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="tg-pager">
            {list.data.page > 1 ? <Link href={pageHref(filters, list.data.page - 1)}>Previous</Link> : <span>Previous</span>}
            <span>
              Page {list.data.page} of {Math.max(1, Math.ceil(list.data.total / list.data.pageSize))}
            </span>
            {list.data.page * list.data.pageSize < list.data.total ? (
              <Link href={pageHref(filters, list.data.page + 1)}>Next</Link>
            ) : (
              <span>Next</span>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
