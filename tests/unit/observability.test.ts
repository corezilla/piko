import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../src/observability.js";
import { ManualClock } from "../../src/clock.js";

/**
 * MT-OBS-001 — M009 `observability` executable entry.
 * Covers VRC-OBS-001..004 (envelope, metric semantics, audit, redaction,
 * fail-open, metrics-disabled degradation).
 */
const cfg = (observability?: { log_level: string; metrics_enabled: boolean }) => ({
  instance_id: "inst-obs-test",
  observability,
});

describe("M009 observability", () => {
  it("VRC-OBS-001: emit produces a fixed envelope with task/generation/epoch", () => {
    const clock = new ManualClock(Date.parse("2026-01-01T00:00:00.000Z"));
    const obs = new Observability(cfg(), clock);
    obs.emit("task.state_changed", { task_id: "t-1", generation: 0, epoch: 3, from: "Queued", to: "Running" });
    const [event] = obs.snapshot().recent_events;
    expect(event.event_name).toBe("task.state_changed");
    expect(event.at).toBe("2026-01-01T00:00:00.000Z");
    expect(event.instance_id).toBe("inst-obs-test");
    expect(event.task_id).toBe("t-1");
    expect(event.generation).toBe(0);
    expect(event.epoch).toBe(3);
    expect(event.fields).toMatchObject({ from: "Queued", to: "Running" });
  });

  it("VRC-OBS-002: metric ops respect inc / observe / set and label keysets", () => {
    const obs = new Observability(cfg({ log_level: "info", metrics_enabled: true }));
    obs.metric("model.latency", "observe", 120, { model: "m1" }, "ms");
    obs.metric("model.latency", "observe", 40, { model: "m1" }, "ms");
    obs.metric("task.count", "inc");
    obs.metric("task.count", "inc", 1);
    obs.metric("worker.concurrency", "set", 4, undefined, "count");
    const { metrics } = obs.snapshot();
    // observe is a windowed gauge -> keeps the minimum, not the last value.
    expect(metrics["model.latency{model=m1}"]!.value).toBe(40);
    expect(metrics["model.latency{model=m1}"]!.unit).toBe("ms");
    expect(metrics["task.count"]!.value).toBe(2);
    expect(metrics["worker.concurrency"]!.value).toBe(4);
  });

  it("VRC-OBS-002: identical label sets collapse to one series key", () => {
    const obs = new Observability(cfg({ log_level: "info", metrics_enabled: true }));
    obs.metric("tool.calls", "inc", 1, { tool: "read", outcome: "ok" });
    obs.metric("tool.calls", "inc", 1, { outcome: "ok", tool: "read" });
    const keys = Object.keys(obs.snapshot().metrics);
    expect(keys).toEqual(["tool.calls{outcome=ok,tool=read}"]);
    expect(obs.snapshot().metrics[keys[0]!]!.value).toBe(2);
  });

  it("VRC-OBS-003: audit records are retained separately from log events", () => {
    const obs = new Observability(cfg());
    obs.audit({ event_name: "event.audit.forced-purge", task_id: "t-9", detail: { scope: "task", bytes: 12 } });
    const snap = obs.snapshot();
    expect(snap.audit_tail).toHaveLength(1);
    expect(snap.audit_tail[0]!.event_name).toBe("event.audit.forced-purge");
    expect(snap.audit_tail[0]!.task_id).toBe("t-9");
    expect(snap.recent_events).toHaveLength(0);
  });

  it("VRC-OBS-001: secrets and prompt-bearing fields are redacted at the boundary", () => {
    expect(redact({ authorization: "Bearer abc", api_key: "k", instruction: "do it", task_id: "t-1", n: 5 })).toEqual({
      authorization: "[redacted]",
      api_key: "[redacted]",
      instruction: "[redacted]",
      task_id: "t-1",
      n: 5,
    });
    const obs = new Observability(cfg());
    obs.emit("provider.request", { credential_ref: "secret://x", model: "m1" });
    expect(obs.snapshot().recent_events[0]!.fields).toMatchObject({ credential_ref: "[redacted]", model: "m1" });
  });

  it("VRC-OBS-004: metrics_enabled=false degrades metrics but keeps events", () => {
    const obs = new Observability(cfg({ log_level: "info", metrics_enabled: false }));
    obs.metric("task.count", "inc");
    obs.emit("task.admitted", { task_id: "t-1" });
    const snap = obs.snapshot();
    expect(snap.metrics).toEqual({});
    expect(snap.recent_events).toHaveLength(1);
  });

  it("fail-open: sink failures degrade only observability, never the caller", () => {
    const obs = new Observability(cfg());
    const boom = (() => {
      throw new Error("sink down");
    }) as unknown as () => never;
    expect(() =>
      obs.emit("x", Object.defineProperty({ a: 1 }, "task_id", { get: boom, enumerable: true })),
    ).not.toThrow();
    expect(() => obs.audit({ event_name: "e", task_id: null, detail: Object.defineProperty({}, "d", { get: boom, enumerable: true }) })).not.toThrow();
  });

  it("snapshot is bounded so the endpoint cannot grow without limit", () => {
    const obs = new Observability(cfg());
    for (let i = 0; i < 600; i += 1) obs.emit("task.tick", { task_id: `t-${i}` });
    const snap = obs.snapshot();
    expect(snap.recent_events).toHaveLength(50);
    expect(snap.recent_events.at(-1)!.fields!.task_id).toBe("t-599");
  });

  it("counters back operational totals used by the operator snapshot", () => {
    const obs = new Observability(cfg());
    obs.bump("p1.restart");
    obs.bump("p1.restart");
    obs.bump("p1.exit");
    expect(obs.snapshot().counters).toEqual({ "p1.restart": 2, "p1.exit": 1 });
  });
});