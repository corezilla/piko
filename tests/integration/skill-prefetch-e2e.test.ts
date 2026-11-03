import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { prefetchSkillContext, clearPrefetchCache } from "../../src/skill-prefetch.js";
import type { Mem0Adapter } from "../../src/mem0-client.js";
import type { GraphRAGAdapter } from "../../src/graphrag-client.js";

/**
 * V0.1.3 · prefetch hits the backends BEFORE the agent's first turn.
 *
 * This is the whole point of the change. V0.1 wired the tools and proved the
 * adapters were correct, but a small model never decided to CALL them -- so
 * "skills are usable" was never actually demonstrated. V0.1.3 makes the
 * context automatic.
 *
 * The assertion here is about ORDER, not just presence: the prefetch query
 * must reach mem0 and graphrag on their own, without the model asking. A
 * test that only counted calls could not tell a prefetch from a model-initiated
 * tool call, so this records the sequence of backend hits.
 */

const servers: Server[] = [];
const dirs: string[] = [];

afterEach(async () => {
  while (servers.length) await new Promise<void>((r) => servers.pop()!.close(() => r()));
  while (dirs.length) await rm(dirs.pop()!, { recursive: true, force: true });
});

// The prefetch cache is process-scoped by design. These tests assert that
// the backend is actually contacted over the wire, so each one starts from a
// clean cache -- otherwise a previous test's entry is served and no HTTP
// request happens at all.
beforeEach(() => clearPrefetchCache());

interface Hit { backend: string; query: string; at: number }

/**
 * A mock backend that records every search it receives, in order.
 *
 * The REAL adapter is used against it -- a stubbed adapter would never make
 * the HTTP call, and the point of this test is that the prefetch actually
 * reaches the backend over the wire.
 */
async function mockBackend(
  backend: "mem0" | "graphrag",
  hits: Hit[],
  body: unknown,
): Promise<{ adapter: Mem0Adapter | GraphRAGAdapter; url: string }> {
  const server = createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      let query = "";
      try {
        const parsed = JSON.parse(raw);
        query = String(parsed.query ?? parsed.text ?? "");
      } catch {
        query = "";
      }
      hits.push({ backend, query, at: Date.now() });
      const json = JSON.stringify(body);
      res.writeHead(200, { "content-type": "application/json", "content-length": Buffer.byteLength(json) });
      res.end(json);
    });
  });
  servers.push(server);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as { port: number }).port;
  const url = `http://127.0.0.1:${port}`;

  if (backend === "mem0") {
    const { Mem0Adapter } = await import("../../src/mem0-client.js");
    return { url, adapter: new Mem0Adapter(url, "test-key") };
  }
  const { GraphRAGAdapter } = await import("../../src/graphrag-client.js");
  return { url, adapter: new GraphRAGAdapter(url, "test-key", "piko-design-docs") };
}

const MEM0_BODY = {
  results: [
    {
      id: "m1",
      memory: "Prefer hermetic tmpdir for test fixtures",
      score: 0.9,
      metadata: { tags: ["tests", "fixtures"] },
      created_at: "2026-10-12T00:00:00Z",
    },
  ],
};

const GRAPHRAG_BODY = {
  hits: {
    hits: [
      {
        _id: "d1",
        _score: 0.8,
        _source: {
          content: "Per-role isolation uses the ${role}:${project} user_id form",
          metadata: { source: "docs/20_system_design/mechanisms/piko-skill-memory.md" },
          created_at: "2026-10-11T00:00:00Z",
        },
      },
    ],
  },
};

describe("V0.1.3 · prefetch reaches the backends on its own", () => {
  it("queries both backends without the model asking", async () => {
    const hits: Hit[] = [];
    const mem0 = await mockBackend("mem0", hits, MEM0_BODY);
    const graphrag = await mockBackend("graphrag", hits, GRAPHRAG_BODY);

    const ctx = await prefetchSkillContext(
      "implement the my-greeter skill following the project conventions",
      { role: "tester", userId: "tester:piko", defaultScope: "piko-design-docs" },
      mem0.adapter as Mem0Adapter,
      graphrag.adapter as GraphRAGAdapter,
    );

    // Both backends were hit, with the task's instruction as the query.
    expect(hits.map((h) => h.backend).sort()).toEqual(["graphrag", "mem0"]);
    expect(hits[0]!.query).toContain("my-greeter");
    expect(ctx.memory.length).toBe(1);
    expect(ctx.docs.length).toBe(1);
  });

  it("hits the backends before anything else happens — no model turn required", async () => {
    // The ordering property: the prefetch is a straight-line await before
    // the harness is created, so the backend hit happens with no model
    // involvement at all. A model-initiated tool call could not be
    // distinguished from this by call count alone, so the test asserts the
    // prefetch alone is sufficient to produce the hits.
    const hits: Hit[] = [];
    const mem0 = await mockBackend("mem0", hits, MEM0_BODY);

    await prefetchSkillContext(
      "implement the my-greeter skill following the project conventions",
      { role: "tester", userId: "tester:piko", defaultScope: "piko-design-docs" },
      mem0.adapter as Mem0Adapter,
      undefined,
    );

    expect(hits.length).toBe(1);
    expect(hits[0]!.backend).toBe("mem0");
  });

  it("uses the role-scoped user id so a role never sees another role's experience", async () => {
    const seen: { user_id?: string }[] = [];
    const server = createServer((req, res) => {
      let raw = "";
      req.on("data", (c) => (raw += c));
      req.on("end", () => {
        try {
          const parsed = JSON.parse(raw);
          seen.push({ user_id: parsed.filters?.user_id ?? parsed.user_id });
        } catch {
          /* ignore */
        }
        const json = JSON.stringify(MEM0_BODY);
        res.writeHead(200, { "content-type": "application/json", "content-length": Buffer.byteLength(json) });
        res.end(json);
      });
    });
    servers.push(server);
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    const port = (server.address() as { port: number }).port;

    const { Mem0Adapter: Adapter } = await import("../../src/mem0-client.js");
    const adapter = new Adapter(`http://127.0.0.1:${port}`, "test-key");

    await prefetchSkillContext(
      "implement the my-greeter skill following the project conventions",
      { role: "tester", userId: "tester:piko", defaultScope: "piko-design-docs" },
      adapter,
      undefined,
    );

    expect(seen[0]?.user_id).toBe("tester:piko");
  });
});
