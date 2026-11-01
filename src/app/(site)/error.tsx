"use client";

import { RetryButton } from "@/features/catalog/presentation/state-message";

export default function SiteError({ error }: { error: Error }) {
  return (
    <div className="tg-wrap tg-section">
      <div className="tg-alert" role="alert">
        <h1 className="tg-title">This page could not be loaded</h1>
        <p className="tg-muted">{error.message || "Refresh the page and try the catalogue again."}</p>
        <RetryButton />
      </div>
    </div>
  );
}
