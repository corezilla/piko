import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  prefetchSkillContext,
  renderSkillContext,
  renderMemoryEntry,
  renderDocEntry,
  clearPrefetchCache,
  prefetchCacheSize,
  DEFAULT_PREFETCH_MAX_RESULTS,
  MAX_QUERY_CHARS,
  type PrefetchIdentity,
} from "./skill-prefetch.js";
import type { Mem0Adapter, Mem0SearchResult } from "./mem0-client.js";
import type { GraphRAGAdapter, GraphRAGSearchResult } from "./graphrag-client.js";

/**
 * V0.1.3 · skill auto-prefetch.
 *
 * The properties under test are the two that make prefetch safe to ship:
 * it NEVER throws and NEVER lets one dead backend take down the other.
 */

const identity: PrefetchIdentity = {
  role: "tester",
  userId: "tester:piko",
  defaultScope: "piko-design-docs",
};

function memory(over: Partial<Mem0SearchResult> = {}): Mem0SearchResult {
  return {
    id: "m1",
    memory: "Prefer hermetic tmpdir for test fixtures",
    score: 0.9,
    metadata: { tags: ["tests", "fixtures"] },
    created_at: "2026-10-12T00:00:00Z",
    ...over,
  };
}

function doc(over: Partial<GraphRAGSearchResult> = {}): GraphRAGSearchResult {
  return {
    id: "d1",
    content: "Per-role isolation uses the ${role}:${project} user_id form",
    score: 0.8,
    metadata: { source: "docs/20_system_design/mechanisms/piko-skill-memory.md §3.2" },
    created_at: "2026-10-11T00:00:00Z",
    ...over,
  };
}

const INSTRUCTION = "implement the my-greeter skill following the project conventions";

// The cache is process-scoped by design, so each test starts from a clean
// one -- otherwise an earlier success is served to a later test that
// expects a failure.
beforeEach(() => clearPrefetchCache());

/** A mem0 stub that returns the given result (or rejects). */
function mem0Stub(behaviour: { ok?: Mem0SearchResult[]; error?: Error; delayMs?: number }) {
  return {
    async search(): Promise<Mem0SearchResult[]> {
      if (behaviour.delayMs) await new Promise((r) => setTimeout(r, behaviour.delayMs));
      if (behaviour.error) throw behaviour.error;
      return behaviour.ok ?? [];
    },
  } as unknown as Mem0Adapter;
}

/** A graphrag stub that returns the given result (or rejects). */
function graphragStub(behaviour: { ok?: GraphRAGSearchResult[]; error?: Error; delayMs?: number }) {
  return {
    async search(): Promise<GraphRAGSearchResult[]> {
      if (behaviour.delayMs) await new Promise((r) => setTimeout(r, behaviour.delayMs));
      if (behaviour.error) throw behaviour.error;
      return behaviour.ok ?? [];
    },
  } as unknown as GraphRAGAdapter;
}

describe("V0.1.3 · prefetchSkillContext", () => {
  it("returns memory entries when the mem0 backend answers", async () => {
    const ctx = await prefetchSkillContext(
      INSTRUCTION,
      identity,
      mem0Stub({ ok: [memory()] }),
      graphragStub({ ok: [doc()] }),
    );
    assert.equal(ctx.memory.length, 1);
    assert.equal(ctx.docs.length, 1);
    assert.equal(ctx.sources.memory, "ok");
    assert.equal(ctx.sources.docs, "ok");
  });

  it("returns empty arrays when BOTH backends reject, and does not throw", async () => {
    const ctx = await prefetchSkillContext(
      INSTRUCTION,
      identity,
      mem0Stub({ error: new Error("mem0 down") }),
      graphragStub({ error: new Error("graphrag down") }),
    );
    assert.deepEqual(ctx.memory, []);
    assert.deepEqual(ctx.docs, []);
    assert.equal(ctx.sources.memory, "unavailable");
    assert.equal(ctx.sources.docs, "unavailable");
  });

  it("keeps the mem0 result when graphrag rejects", async () => {
    const ctx = await prefetchSkillContext(
      INSTRUCTION,
      identity,
      mem0Stub({ ok: [memory()] }),
      graphragStub({ error: new Error("graphrag down") }),
    );
    assert.equal(ctx.memory.length, 1);
    assert.equal(ctx.sources.memory, "ok");
    assert.equal(ctx.sources.docs, "unavailable");
  });

  it("keeps the graphrag result when mem0 rejects", async () => {
    const ctx = await prefetchSkillContext(
      INSTRUCTION,
      identity,
      mem0Stub({ error: new Error("mem0 down") }),
      graphragStub({ ok: [doc()] }),
    );
    assert.equal(ctx.docs.length, 1);
    assert.equal(ctx.sources.memory, "unavailable");
    assert.equal(ctx.sources.docs, "ok");
  });

  it("times out gracefully: a slow backend does not block past the budget", async () => {
    const started = Date.now();
    const ctx = await prefetchSkillContext(
      INSTRUCTION,
      identity,
      mem0Stub({ delayMs: 5000 }),
      graphragStub({ ok: [doc()] }),
      { timeoutMs: 120 },
    );
    const elapsed = Date.now() - started;
    assert.ok(elapsed < 2000, `prefetch took ${elapsed}ms, expected to give up near 120ms`);
    assert.equal(ctx.sources.memory, "unavailable");
    // The fast backend still served.
    assert.equal(ctx.docs.length, 1);
  });

  it("never throws when a backend rejects synchronously", async () => {
    const ctx = await prefetchSkillContext(
      INSTRUCTION,
      identity,
      mem0Stub({ error: new Error("boom") }),
      undefined,
    );
    assert.deepEqual(ctx.memory, []);
  });

  it("skips a trivial instruction", async () => {
    const ctx = await prefetchSkillContext("hi", identity, mem0Stub({ ok: [memory()] }), graphragStub({ ok: [doc()] }));
    assert.equal(ctx.skipped, "short_instruction");
    assert.deepEqual(ctx.memory, []);
    assert.deepEqual(ctx.docs, []);
  });

  it("skips when the operator disabled prefetch", async () => {
    const ctx = await prefetchSkillContext(
      INSTRUCTION,
      identity,
      mem0Stub({ ok: [memory()] }),
      graphragStub({ ok: [doc()] }),
      { disabled: true },
    );
    assert.equal(ctx.skipped, "disabled");
  });

  it("skips a no_skill task", async () => {
    const ctx = await prefetchSkillContext(
      INSTRUCTION,
      identity,
      mem0Stub({ ok: [memory()] }),
      graphragStub({ ok: [doc()] }),
      { kind: "no_skill" },
    );
    assert.equal(ctx.skipped, "no_skill");
  });

  it("skips when there is no identity", async () => {
    const ctx = await prefetchSkillContext(INSTRUCTION, undefined, mem0Stub({ ok: [memory()] }), undefined);
    assert.equal(ctx.skipped, "no_identity");
  });

  it("skips when there are no backends configured", async () => {
    const ctx = await prefetchSkillContext(INSTRUCTION, identity, undefined, undefined);
    assert.equal(ctx.skipped, "no_backends");
  });

  it("caps the query length", async () => {
    let seen = "";
    const mem0 = {
      async search(query: string): Promise<Mem0SearchResult[]> {
        seen = query;
        return [];
      },
    } as unknown as Mem0Adapter;
    await prefetchSkillContext("x".repeat(5000), identity, mem0, undefined);
    assert.equal(seen.length, MAX_QUERY_CHARS);
  });

  it("reports an empty result as empty, not as an error", async () => {
    const ctx = await prefetchSkillContext(INSTRUCTION, identity, mem0Stub({ ok: [] }), graphragStub({ ok: [] }));
    assert.equal(ctx.sources.memory, "empty");
    assert.equal(ctx.sources.docs, "empty");
    assert.deepEqual(ctx.memory, []);
  });
});

describe("V0.1.3 · the process-scoped cache", () => {
  /** A mem0 stub that counts how many times it was searched. */
  function countingMem0() {
    let calls = 0;
    const adapter = {
      async search(): Promise<Mem0SearchResult[]> {
        calls++;
        return [memory()];
      },
    } as unknown as Mem0Adapter;
    return { adapter, calls: () => calls };
  }

  it("serves the second identical task from cache without contacting the backend", async () => {
    clearPrefetchCache();
    const m = countingMem0();
    const first = await prefetchSkillContext(INSTRUCTION, identity, m.adapter, undefined);
    const second = await prefetchSkillContext(INSTRUCTION, identity, m.adapter, undefined);
    assert.equal(m.calls(), 1, "the backend should be contacted once, not twice");
    assert.equal(first.memory.length, 1);
    assert.equal(second.memory.length, 1);
    clearPrefetchCache();
  });

  it("re-fetches when the instruction differs — the cache never serves stale context", async () => {
    clearPrefetchCache();
    const m = countingMem0();
    await prefetchSkillContext(INSTRUCTION, identity, m.adapter, undefined);
    await prefetchSkillContext("a completely different task instruction here", identity, m.adapter, undefined);
    assert.equal(m.calls(), 2);
    clearPrefetchCache();
  });

  it("does not cache a total failure, so the next task retries", async () => {
    clearPrefetchCache();
    const failing = {
      async search(): Promise<Mem0SearchResult[]> {
        throw new Error("down");
      },
    } as unknown as Mem0Adapter;
    await prefetchSkillContext(INSTRUCTION, identity, failing, undefined);
    assert.equal(prefetchCacheSize(), 0, "a failed fetch must not be cached");
    clearPrefetchCache();
  });

  it("bypasses the cache when asked to", async () => {
    clearPrefetchCache();
    const m = countingMem0();
    await prefetchSkillContext(INSTRUCTION, identity, m.adapter, undefined);
    await prefetchSkillContext(INSTRUCTION, identity, m.adapter, undefined, { noCache: true });
    assert.equal(m.calls(), 2);
    clearPrefetchCache();
  });
});

describe("V0.1.3 · rendering the context section", () => {
  it("always emits the section, even when empty", async () => {
    const ctx = await prefetchSkillContext(INSTRUCTION, identity, mem0Stub({ ok: [] }), graphragStub({ ok: [] }));
    const rendered = renderSkillContext(ctx);
    assert.ok(rendered.includes("=== Context ==="));
    assert.ok(rendered.includes("(0 found)"));
    assert.ok(rendered.includes("no prior experience found"));
    assert.ok(rendered.includes("no project docs found"));
  });

  it("says so when a backend was unavailable rather than claiming nothing was found", async () => {
    const ctx = await prefetchSkillContext(
      INSTRUCTION,
      identity,
      mem0Stub({ error: new Error("down") }),
      graphragStub({ ok: [] }),
    );
    const rendered = renderSkillContext(ctx);
    assert.ok(rendered.includes("prior experience unavailable"));
    assert.ok(rendered.includes("no project docs found"));
  });

  it("renders the entries when they exist", async () => {
    const ctx = await prefetchSkillContext(
      INSTRUCTION,
      identity,
      mem0Stub({ ok: [memory()] }),
      graphragStub({ ok: [doc()] }),
    );
    const rendered = renderSkillContext(ctx);
    assert.ok(rendered.includes("hermetic tmpdir"));
    assert.ok(rendered.includes("(1 found)"));
  });

  it("renders a skip reason", async () => {
    const ctx = await prefetchSkillContext("hi", identity, mem0Stub({ ok: [] }), graphragStub({ ok: [] }));
    const rendered = renderSkillContext(ctx);
    assert.ok(rendered.includes("(skipped: short_instruction)"));
  });

  it("truncates a very long entry", () => {
    const rendered = renderMemoryEntry(memory({ memory: "y".repeat(1000) }));
    assert.ok(rendered.length < 400, `rendered entry was ${rendered.length} chars`);
  });

  it("renders a doc entry with its source", () => {
    const rendered = renderDocEntry(doc());
    assert.ok(rendered.includes("piko-skill-memory.md"));
  });

  it("uses the default max results", () => {
    assert.equal(DEFAULT_PREFETCH_MAX_RESULTS, 5);
  });
});
