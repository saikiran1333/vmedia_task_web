"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function RetryButton({ label = "Try again" }: { label?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button type="button" className="tg-button" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
      {pending ? "Trying again…" : label}
    </button>
  );
}

export function StateMessage({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: string;
}) {
  return (
    <div className="tg-alert" role="alert">
      <h2 className="tg-title">{title}</h2>
      <p className="tg-muted">{detail}</p>
      {action ? <p className="tg-muted">{action}</p> : null}
      <RetryButton />
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="tg-product-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="tg-skeleton" />
      ))}
    </div>
  );
}
