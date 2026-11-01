"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  STATUS_LABELS,
  csvHasDataRows,
  enquirySearchParams,
  isEnquiryStatus,
  type EnquiryFilters,
  type EnquiryStatus,
} from "@/features/admin/domain/enquiry-query";

export function StatusControl({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    if (!isEnquiryStatus(value)) {
      setError("Choose New, Contacted, Converted, or Lost.");
      return;
    }
    if (value === status) {
      setMessage(`Status is already ${STATUS_LABELS[value]}.`);
      setError("");
      return;
    }
    const confirmed = window.confirm(`Mark this enquiry as ${STATUS_LABELS[value]}?`);
    if (!confirmed) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/enquiries/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ status: value }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(payload.message || "The status was not updated.");
        return;
      }
      setMessage(`Status updated to ${STATUS_LABELS[value]}.`);
      router.refresh();
    } catch {
      setError("The status was not updated. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="tg-row">
      <label className="tg-field">
        Status
        <select value={value} onChange={(event) => setValue(event.target.value as EnquiryStatus)}>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="tg-button" disabled={pending}>
        {pending ? "Saving…" : "Update status"}
      </button>
      {message ? <p role="status">{message}</p> : null}
      {error ? <p className="tg-error" role="alert">{error}</p> : null}
    </form>
  );
}

export function ExportButton({ filters }: { filters: EnquiryFilters }) {
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const query = enquirySearchParams(filters, { paginate: false }).toString();

  async function download() {
    setPending(true);
    setError("");
    setNote("");
    try {
      const response = await fetch(`/api/admin/enquiries/export?${query}`);
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message || "The export could not be downloaded.");
        return;
      }
      const text = await response.text();
      if (!csvHasDataRows(text)) setNote("The export file has the column headings and no enquiry rows.");
      if (response.headers.get("X-Export-Truncated") === "true") {
        setNote("The export was limited to 5000 rows.");
      }
      const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "vmedia-enquiries.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("The export could not be downloaded.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button type="button" className="tg-button-secondary" onClick={() => void download()} disabled={pending}>
        {pending ? "Preparing CSV…" : "Export CSV"}
      </button>
      {note ? <p className="tg-muted">{note}</p> : null}
      {error ? <p className="tg-error" role="alert">{error}</p> : null}
    </div>
  );
}
