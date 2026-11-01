import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ApiError, describeFailure } from "../src/core/errors/api-error";
import { debugLog } from "../src/core/logging/debug-log";
import { getHealth } from "../src/features/health/application/get-health";
import type { HealthSnapshot } from "../src/features/health/domain/entities/health";
import { getHello } from "../src/features/hello/application/get-hello";
import type { Hello } from "../src/features/hello/domain/entities/hello";

const hello: Hello = {
  greeting: "Hello from Vmedia Enterprise Backend!",
  platform: "Vmedia Platform",
  environment: "test",
  serverTime: "2026-11-01T00:00:00.000Z",
  uptimeSeconds: 1,
};

const health = (connected: boolean): HealthSnapshot => ({
  status: connected ? "UP" : "DEGRADED",
  uptime: 1,
  timestamp: "2026-11-01T00:00:00.000Z",
  database: {
    provider: "Neon Postgres",
    connected,
    database: connected ? "neondb" : null,
    latencyMs: connected ? 12 : null,
    error: connected ? null : "connection refused",
  },
  nodeVersion: "v25",
});

describe("web failure copy", () => {
  test("network, timeout, parse, database, and unknown errors each name the next action", () => {
    assert.equal(describeFailure(new ApiError("down", "network")).title, "Backend unreachable");
    assert.match(describeFailure(new ApiError("slow", "timeout")).action, /port 5000/);
    assert.equal(describeFailure(new ApiError("html", "parse")).title, "Unexpected response");
    assert.equal(describeFailure(new ApiError("db", "http", 503)).title, "Database unavailable");
    assert.equal(describeFailure(new ApiError("nope", "http", 500)).title, "Request failed");
    assert.equal(describeFailure(new Error("boom")).title, "Something went wrong");
  });
});

describe("hello panel loader", () => {
  test("success returns the greeting", async () => {
    const state = await getHello({ getHello: async () => hello });
    assert.equal(state.status, "ready");
    if (state.status === "ready") assert.equal(state.data.platform, "Vmedia Platform");
  });

  test("empty greeting is an error, not a blank card", async () => {
    const state = await getHello({ getHello: async () => ({ ...hello, greeting: "  " }) });
    assert.equal(state.status, "error");
    if (state.status === "error") assert.equal(state.title, "No greeting yet");
  });

  test("repository failure becomes the unreachable panel", async () => {
    const state = await getHello({
      getHello: async () => {
        throw new ApiError("The backend could not be reached.", "network");
      },
    });
    assert.equal(state.status, "error");
    if (state.status === "error") assert.match(state.action, /npm run dev/);
  });
});

describe("health panel loader", () => {
  test("connected Neon snapshot is ready", async () => {
    const state = await getHealth({ getHealth: async () => health(true) });
    assert.equal(state.status, "ready");
  });

  test("disconnected database is a visible error", async () => {
    const state = await getHealth({ getHealth: async () => health(false) });
    assert.equal(state.status, "error");
    if (state.status === "error") assert.equal(state.title, "Database unavailable");
  });

  test("thrown timeout stays a timeout panel", async () => {
    const state = await getHealth({
      getHealth: async () => {
        throw new ApiError("The backend did not respond within 8 seconds.", "timeout");
      },
    });
    assert.equal(state.status, "error");
    if (state.status === "error") assert.equal(state.title, "The backend took too long");
  });
});

describe("debug log", () => {
  test("redacts secret fields and stays quiet in production", () => {
    const lines: string[] = [];
    const original = console.debug;
    console.debug = (line?: unknown) => {
      lines.push(String(line));
    };
    const previous = process.env.NODE_ENV;
    const env = process.env as Record<string, string | undefined>;
    try {
      env.NODE_ENV = "development";
      debugLog("hello", "ready", { platform: "Vmedia", password: "hidden", database_url: "hidden" });
      assert.match(lines[0], /\[web\] \[hello\] ready/);
      assert.match(lines[0], /\[redacted\]/);
      assert.doesNotMatch(lines[0], /hidden/);

      env.NODE_ENV = "production";
      debugLog("hello", "should not print");
      assert.equal(lines.length, 1);
    } finally {
      console.debug = original;
      env.NODE_ENV = previous;
    }
  });
});
