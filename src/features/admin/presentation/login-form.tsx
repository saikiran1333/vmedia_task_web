"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { safeNextPath } from "@/core/auth/admin-gate";

export function LoginForm({ nextPath, reason }: { nextPath: string; reason: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(payload.message || "Email or password is incorrect.");
        return;
      }
      router.push(safeNextPath(nextPath));
      router.refresh();
    } catch {
      setError("The sign-in service could not be reached.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="tg-panel" style={{ padding: 16, display: "grid", gap: 16, maxWidth: 480 }}>
      <h1 className="tg-display">Admin sign in</h1>
      {reason === "expired" ? <p className="tg-muted">Your session ended. Sign in again.</p> : null}
      {error ? (
        <p className="tg-error" role="alert">
          {error}
        </p>
      ) : null}
      <label className="tg-field">
        Email
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="username" required />
      </label>
      <label className="tg-field">
        Password
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <button className="tg-button" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
