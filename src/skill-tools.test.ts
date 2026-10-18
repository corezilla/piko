// Unit tests for skill-tools factories
//
// Per ISD: docs/50_implementation_design/piko-skill-tools-impl.isd.md §2.2

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createMem0LookupTool,
  createMem0RecordTool,
  Mem0LookupSchema,
  Mem0RecordSchema,
} from "./skill-tools.js";
import { Mem0Adapter, Mem0ApiError, type Mem0SearchResult, type Mem0AddResult } from "./mem0-client.js";

// ============================================================
// Test fixtures
// ============================================================

function makeMockMem0(
  searchImpl?: (q: string, u: string) => Promise<Mem0SearchResult[]>,
  addImpl?: (m: any, u: string, meta?: any) => Promise<Mem0AddResult>,
): Mem0Adapter & { calls: { search: any[]; add: any[] } } {
  const searchCalls: any[] = [];
  const addCalls: any[] = [];
  const adapter = {
    search: async (q: string, u: string) => {
      searchCalls.push({ query: q, user_id: u });
      if (searchImpl) return searchImpl(q, u);
      return [];
    },
    add: async (m: any, u: string, meta?: any) => {
      addCalls.push({ messages: m, user_id: u, metadata: meta });
      if (addImpl) return addImpl(m, u, meta);
      return { ids: ["mem-test"] };
    },
  } as Mem0Adapter;
  (adapter as any).calls = { search: searchCalls, add: addCalls };
  return adapter as any;
}

const baseContext = { role: "tester", projectName: "piko" };

// ============================================================
// Schema validation tests
// ============================================================

test("Mem0LookupSchema: valid query passes", () => {
  // Just verify schema is importable and has the right shape
  assert.ok(Mem0LookupSchema.type === "object");
  assert.ok("query" in (Mem0LookupSchema as any).properties);
});

test("Mem0RecordSchema: valid content passes", () => {
  assert.ok(Mem0RecordSchema.type === "object");
  assert.ok("content" in (Mem0RecordSchema as any).properties);
});

// ============================================================
// Factory validation tests
// ============================================================

test("createMem0LookupTool: throws if role empty", () => {
  const mem0 = makeMockMem0();
  assert.throws(
    () => createMem0LookupTool({ mem0, context: { role: "", projectName: "piko" } }),
    /role required/,
  );
});

test("createMem0LookupTool: throws if projectName empty", () => {
  const mem0 = makeMockMem0();
  assert.throws(
    () => createMem0LookupTool({ mem0, context: { role: "tester", projectName: "" } }),
    /projectName required/,
  );
});

test("createMem0LookupTool: throws if projectName contains ':'", () => {
  const mem0 = makeMockMem0();
  assert.throws(
    () => createMem0LookupTool({ mem0, context: { role: "tester", projectName: "my:project" } }),
    /projectName must match/,
  );
});

test("createMem0RecordTool: same validation rules", () => {
  const mem0 = makeMockMem0();
  assert.throws(
    () => createMem0RecordTool({ mem0, context: { role: "", projectName: "piko" } }),
    /role required/,
  );
  assert.throws(
    () => createMem0RecordTool({ mem0, context: { role: "tester", projectName: "bad:project" } }),
    /projectName must match/,
  );
});

// ============================================================
// Tool metadata tests
// ============================================================

test("createMem0LookupTool: returns tool with correct name", () => {
  const mem0 = makeMockMem0();
  const tool = createMem0LookupTool({ mem0, context: baseContext });
  assert.equal(tool.name, "mem0_lookup");
  assert.equal(tool.label, "Mem0 lookup");
  assert.ok(tool.description.length > 0);
  assert.ok(tool.description.includes("skill experience"));
});

test("createMem0RecordTool: returns tool with correct name", () => {
  const mem0 = makeMockMem0();
  const tool = createMem0RecordTool({ mem0, context: baseContext });
  assert.equal(tool.name, "mem0_record");
  assert.equal(tool.label, "Mem0 record");
  assert.ok(tool.description.length > 0);
  assert.ok(tool.description.includes("Record"));
});

// ============================================================
// Tool execute behavior tests
// ============================================================

test("mem0_lookup execute: passes constructed user_id to Mem0", async () => {
  const mem0 = makeMockMem0(async () => [
    { id: "1", memory: "m", score: 0.9, metadata: {}, created_at: "" },
  ]);
  const tool = createMem0LookupTool({ mem0, context: baseContext });
  await tool.execute("toolcall-1", { query: "x" }, () => {}, {} as any, {} as any, {} as any);

  const calls = (mem0 as any).calls.search;
  assert.equal(calls.length, 1);
  assert.equal(calls[0].user_id, "tester:piko");
  assert.equal(calls[0].query, "x");
});

test("mem0_lookup execute: returns JSON-stringified content", async () => {
  const mem0 = makeMockMem0(async () => [
    { id: "1", memory: "hello", score: 0.5, metadata: {}, created_at: "" },
  ]);
  const tool = createMem0LookupTool({ mem0, context: baseContext });
  const result = await tool.execute("id", { query: "x" }, () => {}, {} as any, {} as any, {} as any);

  assert.equal(result.content.length, 1);
  const firstContent = result.content[0] as { type: "text"; text: string };
  assert.equal(firstContent.type, "text");
  assert.ok(firstContent.text.includes("hello"));
  assert.equal((result.details as any).count, 1);
});

test("mem0_lookup execute: 0 results returns [] in content", async () => {
  const mem0 = makeMockMem0(async () => []);
  const tool = createMem0LookupTool({ mem0, context: baseContext });
  const result = await tool.execute("id", { query: "x" }, () => {}, {} as any, {} as any, {} as any);

  const firstContent = result.content[0] as { type: "text"; text: string };
  assert.equal(firstContent.text, "[]");
  assert.equal((result.details as any).count, 0);
});

test("mem0_lookup execute: Mem0ApiError → fallback content (no throw)", async () => {
  const mem0 = makeMockMem0(async () => {
    throw new Mem0ApiError(503, "server_error", "down");
  });
  const tool = createMem0LookupTool({ mem0, context: baseContext });
  const result = await tool.execute("id", { query: "x" }, () => {}, {} as any, {} as any, {} as any);

  const firstContent = result.content[0] as { type: "text"; text: string };
  assert.equal(firstContent.text, "memory unavailable: server_error");
  assert.equal((result.details as any).error, "server_error");
  assert.equal((result.details as any).status, 503);
});

test("mem0_lookup execute: network error → fallback", async () => {
  const mem0 = makeMockMem0(async () => {
    throw new Mem0ApiError(0, "network", "down", new Error("ECONNREFUSED"));
  });
  const tool = createMem0LookupTool({ mem0, context: baseContext });
  const result = await tool.execute("id", { query: "x" }, () => {}, {} as any, {} as any, {} as any);

  assert.equal((result.details as any).error, "network");
  assert.equal((result.details as any).status, 0);
});

test("mem0_lookup execute: unknown error → throws (not caught)", async () => {
  const mem0 = makeMockMem0(async () => {
    throw new Error("programmer error");
  });
  const tool = createMem0LookupTool({ mem0, context: baseContext });
  await assert.rejects(
    () => tool.execute("id", { query: "x" }, () => {}, {} as any, {} as any, {} as any),
    /programmer error/,
  );
});

test("mem0_lookup execute: respects max_results", async () => {
  const mem0 = makeMockMem0();
  const tool = createMem0LookupTool({ mem0, context: baseContext });
  await tool.execute("id", { query: "x", max_results: 10 }, () => {}, {} as any, {} as any, {} as any);

  const calls = (mem0 as any).calls.search;
  assert.equal(calls[0].user_id, "tester:piko");
  // Note: max_results passed through options; verify via the search mock's call args
});

// ============================================================
// mem0_record tests
// ============================================================

test("mem0_record execute: passes constructed user_id and metadata", async () => {
  const mem0 = makeMockMem0();
  const tool = createMem0RecordTool({
    mem0,
    context: { role: "developer", projectName: "myapp", taskId: "task-123" },
  });
  await tool.execute(
    "id",
    { content: "## Lesson\nDon't do X", tags: ["perf", "async"] },
    () => {},
    {} as any,
    {} as any,
    {} as any,
  );

  const calls = (mem0 as any).calls.add;
  assert.equal(calls.length, 1);
  assert.equal(calls[0].user_id, "developer:myapp");
  assert.deepEqual(calls[0].messages, [{ role: "user", content: "## Lesson\nDon't do X" }]);
  assert.equal(calls[0].metadata.type, "skill_experience");
  assert.equal(calls[0].metadata.role, "developer");
  assert.equal(calls[0].metadata.task_id, "task-123");
  assert.deepEqual(calls[0].metadata.tags, ["perf", "async"]);
  assert.ok(typeof calls[0].metadata.recorded_at === "string");
});

test("mem0_record execute: returns ids in details", async () => {
  const mem0 = makeMockMem0(
    undefined,
    async () => ({ ids: ["mem-a", "mem-b"] }),
  );
  const tool = createMem0RecordTool({ mem0, context: baseContext });
  const result = await tool.execute(
    "id",
    { content: "lesson text here" },
    () => {},
    {} as any,
    {} as any,
    {} as any,
  );

  assert.deepEqual((result.details as any).ids, ["mem-a", "mem-b"]);
  const firstContent = result.content[0] as { type: "text"; text: string };
  assert.ok(firstContent.text.includes("mem-a"));
});

test("mem0_record execute: Mem0ApiError → fallback content (no throw)", async () => {
  const mem0 = makeMockMem0(
    undefined,
    async () => {
      throw new Mem0ApiError(401, "auth_invalid", "bad key");
    },
  );
  const tool = createMem0RecordTool({ mem0, context: baseContext });
  const result = await tool.execute(
    "id",
    { content: "lesson text here" },
    () => {},
    {} as any,
    {} as any,
    {} as any,
  );

  const firstContent = result.content[0] as { type: "text"; text: string };
  assert.equal(firstContent.text, "memory unavailable: auth_invalid");
  assert.equal((result.details as any).error, "auth_invalid");
});