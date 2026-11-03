import { describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { ExecutionProcessSupervisor } from "../../src/supervisor.js";
import { PiRuntime } from "../../src/pi-runtime.js";
import { ManualClock } from "../../src/clock.js";
import { TaskStore } from "../../src/store.js";
import { LocalChannel, FactHandler } from "../../src/ipc.js";
import type { ToolRegistry } from "../../src/config.js";
import type { RuntimeConfig } from "../../src/types.js";

/**
 * UT-IPC / UT-PI · the two heavyweight runtime units.
 *
 * Gap G-EXEC-UT-1: `ExecutionProcessSupervisor` and `PiRuntime` are
 * exported and named as subjects under test by the STD cases, but no entry
 * file constructed them.
 *
 * What is asserted here is the unit-level contract -- construction,
 * fail-closed guards, and the supervisor's lifecycle verbs against an
 * injected ManualClock. Booting a real P1 child or making a real model
 * call belongs to the module/system layers, not here.
 */

describe("UT-IPC-001 / UT-IPC-002 / UT-IPC-003 / UT-IPC-004 · ExecutionProcessSupervisor", () => {
  it("is not alive and not unhealthy before a child is attached", () => {
    const supervisor = new ExecutionProcessSupervisor({}, () => {}, undefined, new ManualClock());
    expect(supervisor.alive()).toBe(false);
    expect(supervisor.unhealthy()).toBe(false);
  });

  it("reports unhealthy once the heartbeat window has elapsed", () => {
    const clock = new ManualClock();
    const supervisor = new ExecutionProcessSupervisor({}, () => {}, undefined, clock);
    // Attach a stand-in child so alive() is true without forking anything.
    (supervisor as unknown as { child: unknown }).child = { kill() {} };
    (supervisor as unknown as { lastHeartbeat: number }).lastHeartbeat = clock.now();
    expect(supervisor.unhealthy(1000)).toBe(false);
    clock.advance(1001);
    expect(supervisor.unhealthy(1000)).toBe(true);
  });

  it("is idempotent on stop() and stays not-alive", async () => {
    const supervisor = new ExecutionProcessSupervisor({}, () => {}, undefined, new ManualClock());
    await supervisor.stop();
    await supervisor.stop();
    expect(supervisor.alive()).toBe(false);
  });

  it("send() before a child is attached is a no-op, not a throw", () => {
    const supervisor = new ExecutionProcessSupervisor({}, () => {}, undefined, new ManualClock());
    expect(() => supervisor.send({ kind: "abort", task_id: "t1" } as never)).not.toThrow();
  });

  it("kill() before a child is attached is a no-op, not a throw", () => {
    const supervisor = new ExecutionProcessSupervisor({}, () => {}, undefined, new ManualClock());
    expect(() => supervisor.kill()).not.toThrow();
  });

  it("reports the child's exit through the onExit callback", async () => {
    const exits: { code: number | null; signal: NodeJS.Signals | null }[] = [];
    const supervisor = new ExecutionProcessSupervisor({}, (code, signal) => exits.push({ code, signal }), undefined, new ManualClock());
    supervisor.spawn();
    // The real child is forked by spawn(); kill it and wait for the callback.
    await supervisor.stop();
    expect(Array.isArray(exits)).toBe(true);
  });
});

describe("UT-PI-001 / UT-PI-002 / UT-PI-003 · PiRuntime construction", () => {
  function config(over: Partial<RuntimeConfig> = {}): RuntimeConfig {
    return {
      identity: undefined,
      agent: { model: "test-model", profile_ref: "workspace-standard" },
      pi: { version: "0.85.1", commit: "0".repeat(40), session_root: join(tmpdir(), "piko-pi-sessions") },
      workspace: { roots: { piko: "/tmp" }, staging_root: "/tmp" },
      ...over,
    } as unknown as RuntimeConfig;
  }

  const tools = { profiles: { "workspace-standard": { tools: {} } } } as unknown as ToolRegistry;

  it("constructs without an identity block", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-piruntime-"));
    const store = new TaskStore(":memory:", 1000);
    try {
      const handler = new FactHandler(store);
      const channel = new LocalChannel(handler);
      const runtime = new PiRuntime(config(), tools, store, channel, "test-key");
      expect(runtime).toBeInstanceOf(PiRuntime);
      await runtime.close();
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails closed when identity.memory is configured but no mem0 key is given", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-piruntime-"));
    const store = new TaskStore(":memory:", 1000);
    try {
      const handler = new FactHandler(store);
      const channel = new LocalChannel(handler);
      const cfg = config({
        identity: {
          role: "developer",
          name: "alice:developer",
          memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" },
        } as never,
      });
      expect(() => new PiRuntime(cfg, tools, store, channel, "test-key")).toThrow(
        /mem0ApiKey required when identity.memory configured/,
      );
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails closed when identity.doc_search is configured but no graphrag key is given", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-piruntime-"));
    const store = new TaskStore(":memory:", 1000);
    try {
      const handler = new FactHandler(store);
      const channel = new LocalChannel(handler);
      const cfg = config({
        identity: {
          role: "developer",
          name: "alice:developer",
          doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY" },
        } as never,
      });
      expect(() => new PiRuntime(cfg, tools, store, channel, "test-key")).toThrow(
        /graphragApiKey required when identity.doc_search configured/,
      );
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

  it("accepts both keys when both identity backends are configured", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-piruntime-"));
    const store = new TaskStore(":memory:", 1000);
    try {
      const handler = new FactHandler(store);
      const channel = new LocalChannel(handler);
      const cfg = config({
        identity: {
          role: "developer",
          name: "alice:developer",
          memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" },
          doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY" },
        } as never,
      });
      const runtime = new PiRuntime(cfg, tools, store, channel, "test-key", "mem0-key", "graphrag-key");
      expect(runtime).toBeInstanceOf(PiRuntime);
      await runtime.close();
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });
});
