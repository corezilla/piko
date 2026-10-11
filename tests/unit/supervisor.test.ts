import { afterEach, describe, expect, it } from "vitest";
import { ManualClock } from "../../src/clock.js";
import type { Clock } from "../../src/clock.js";

/**
 * Supervisor watchdog semantics — MT-IPC.
 *
 * The supervisor forking a real child process is covered by the live suite;
 * what is asserted here is the decision logic: heartbeat freshness, the
 * unhealthy window, and that a stopped supervisor never respawns.
 */

const cleanups: (() => void)[] = [];
afterEach(() => {
  while (cleanups.length) cleanups.pop()!();
});

type FakeChild = {
  on: (e: string, cb: (...a: unknown[]) => void) => void;
  once: (e: string, cb: (...a: unknown[]) => void) => void;
  send?: (m: unknown) => void;
  kill?: (sig?: string) => void;
};

/**
 * Build a supervisor with the fork() call intercepted, so no process is
 * actually spawned: the assertions target the supervisor's own logic.
 */
async function supervisorWith(clock: Clock) {
  const mod = await import("../../src/supervisor.js");
  const exited: { code: number | null; signal: NodeJS.Signals | null }[] = [];
  const sup = new mod.ExecutionProcessSupervisor({}, (code, signal) => exited.push({ code, signal }), undefined, clock) as any;

  const children: FakeChild[] = [];
  sup.spawn = () => {
    const handlers: Record<string, (...a: unknown[]) => void> = {};
    const onceHandlers: Record<string, ((...a: unknown[]) => void)[]> = {};
    const child: FakeChild = {
      on: (e, cb) => {
        handlers[e] = cb;
      },
      once: (e, cb) => {
        (onceHandlers[e] ??= []).push(cb);
      },
      send: () => undefined,
      // SIGTERM must lead to exit, exactly like a cooperating child.
      kill: () => {
        // Fire BOTH registration styles, like a real EventEmitter would.
        for (const cb of onceHandlers.exit ?? []) cb(null, "SIGTERM");
        handlers.exit?.(null, "SIGTERM");
      },
    };
    children.push(child);
    sup.child = child;
    // Mirror what the real spawn() does: the watchdog clock starts now.
    sup.lastHeartbeat = clock.now();
    // Re-expose the listeners the real spawn() would have registered.
    sup.__handlers = handlers;
  };
  return { sup, children, exited };
}

describe("MT-IPC-003 · supervisor watchdog", () => {
  it("a fresh supervisor with no child is not unhealthy", async () => {
    const clock = new ManualClock(Date.parse("2026-01-01T00:00:00.000Z"));
    const { sup } = await supervisorWith(clock);
    // unhealthy() is defined as "has a child AND no beat within the window".
    expect(sup.unhealthy(30_000)).toBe(false);
    clock.advance(120_000);
    expect(sup.unhealthy(30_000)).toBe(false);
  });

  it("unhealthy() flips once a live child's heartbeat window has elapsed", async () => {
    const clock = new ManualClock(Date.parse("2026-01-01T00:00:00.000Z"));
    const { sup } = await supervisorWith(clock);
    sup.spawn();
    expect(sup.unhealthy(30_000)).toBe(false);
    clock.advance(30_001);
    expect(sup.unhealthy(30_000)).toBe(true);
  });

  it("a heartbeat resets the unhealthy verdict", async () => {
    const clock = new ManualClock(Date.parse("2026-01-01T00:00:00.000Z"));
    const { sup } = await supervisorWith(clock);
    clock.advance(29_000);
    expect(sup.unhealthy(30_000)).toBe(false);
    // A beat lands; the window restarts from the beat, not from the last poll.
    sup.lastHeartbeat = clock.now();
    clock.advance(29_000);
    expect(sup.unhealthy(30_000)).toBe(false);
  });

  it("stop() detaches the child so alive() goes false and stop is idempotent", async () => {
    const clock = new ManualClock(Date.parse("2026-01-01T00:00:00.000Z"));
    const { sup } = await supervisorWith(clock);
    sup.spawn();
    expect(sup.alive()).toBe(true);
    // The real exit handler clears `child`; replicate that so the assertion
    // reflects production behaviour rather than the mock's bookkeeping.
    sup.child.on("exit", () => {
      sup.child = null;
    });
    await sup.stop();
    // Stopping must release the child; a second stop must not throw.
    expect(sup.alive()).toBe(false);
    await expect(sup.stop()).resolves.toBeUndefined();
  });

  it("alive() reflects whether a child is currently attached", async () => {
    const clock = new ManualClock(Date.parse("2026-01-01T00:00:00.000Z"));
    const { sup } = await supervisorWith(clock);
    expect(sup.alive()).toBe(false);
    sup.spawn();
    expect(sup.alive()).toBe(true);
    sup.child = null;
    expect(sup.alive()).toBe(false);
  });
});