"use client";

import { RetryButton } from "@/features/catalog/presentation/state-message";

export default function AdminError({ error }: { error: Error }) {
  return (
    <div className="tg-alert" role="alert">
      <h1 className="tg-title">The admin desk could not be loaded</h1>
      <p className="tg-muted">{error.message}</p>
      <RetryButton />
    </div>
  );
}
