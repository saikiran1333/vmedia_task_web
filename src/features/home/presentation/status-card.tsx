import type { ReactNode } from "react";

export function StatusCard({
  kicker,
  title,
  tone,
  children,
}: {
  kicker: string;
  title: string;
  tone: "ok" | "bad" | "neutral";
  children: ReactNode;
}) {
  return (
    <article className="card">
      <div className="card-kicker">
        <span className={`dot dot-${tone}`} aria-hidden="true" />
        {kicker}
      </div>
      <h2>{title}</h2>
      {children}
    </article>
  );
}

export function FailureBody({ title, detail, action }: { title: string; detail: string; action: string }) {
  return (
    <>
      <p className="failure-title">{title}</p>
      <p>{detail}</p>
      <p className="action">{action}</p>
    </>
  );
}
