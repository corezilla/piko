// Unit tests for graphrag-tools factories
//
// Per ISD: docs/50_implementation_design/piko-graphrag-impl.isd.md §2.2

import { test } from "node:test";
import assert from "node:assert/strict";
import { createGraphragSearchTool, GraphragSearchSchema } from "./graphrag-tools.js";
import { GraphRAGAdapter, GraphRAGApiError, type GraphRAGSearchResult } from "./graphrag-client.js";

// ============================================================
// Test fixtures
// ============================================================

function makeMockGraphrag(
  searchImpl?: (q: string, opts?: any) => Promise<GraphRAGSearchResult[]>,
): GraphRAGAdapter & { calls: { search: any[] } } {
  const searchCalls: any[] = [];
  const adapter = {
    search: async (q: string, opts?: any) => {
      searchCalls.push({ query: q, options: opts ?? {} });
      if (searchImpl) return searchImpl(q, opts);
      return [];
    },
  } as GraphRAGAdapter;
  (adapter as any).calls = { search: searchCalls };
  return adapter as any;
}

const baseContext = { role: "tester", projectName: "piko" };

// ============================================================
// Schema validation tests
// ============================================================

test("GraphragSearchSchema: valid query passes", () => {
  assert.ok(GraphragSearchSchema.type === "object");
  const props = (GraphragSearchSchema as any).properties;
  assert.ok("query" in props);
  assert.ok("scope" in props);
  assert.ok("max_results" in props);
});

// ============================================================
// Factory validation tests
// ============================================================

test("createGraphragSearchTool: throws if role empty", () => {
  const graphrag = makeMockGraphrag();
  assert.throws(
    () => createGraphragSearchTool({ graphrag, context: { role: "", projectName: "piko" } }),
    /role required/,
  );
});

test("createGraphragSearchTool: throws if projectName empty", () => {
  const graphrag = makeMockGraphrag();
  assert.throws(
    () => createGraphragSearchTool({ graphrag, context: { role: "tester", projectName: "" } }),
    /projectName required/,
  );
});

test("createGraphragSearchTool: throws if projectName contains ':'", () => {
  const graphrag = makeMockGraphrag();
  assert.throws(
    () => createGraphragSearchTool({ graphrag, context: { role: "tester", projectName: "my:project" } }),
    /projectName must match/,
  );
});

// ============================================================
// Tool metadata tests
// ============================================================

test("createGraphragSearchTool: returns tool with correct name", () => {
  const graphrag = makeMockGraphrag();
  const tool = createGraphragSearchTool({ graphrag, context: baseContext });
  assert.equal(tool.name, "graphrag_search");
  assert.equal(tool.label, "GraphRAG search");
  assert.ok(tool.description.length > 0);
  assert.ok(tool.description.includes("document corpus"));
});

// ============================================================
// Tool execute behavior tests
// ============================================================

test("graphrag_search execute: forwards query and scope to backend", async () => {
  const graphrag = makeMockGraphrag(async () => [
    { id: "d1", content: "doc text", score: 0.9, metadata: {}, created_at: "" },
  ]);
  const tool = createGraphragSearchTool({ graphrag, context: baseContext });
  await tool.execute(
    "toolcall-1",
    { query: "skill memory", scope: "piko-design-docs" },
    () => {},
    {} as any,
    {} as any,
    {} as any,
  );

  const calls = (graphrag as any).calls.search;
  assert.equal(calls.length, 1);
  assert.equal(calls[0].query, "skill memory");
  assert.equal(calls[0].options.scope, "piko-design-docs");
});

test("graphrag_search execute: forwards max_results to backend", async () => {
  const graphrag = makeMockGraphrag();
  const tool = createGraphragSearchTool({ graphrag, context: baseContext });
  await tool.execute(
    "id",
    { query: "x", max_results: 10 },
    () => {},
    {} as any,
    {} as any,
    {} as any,
  );

  const calls = (graphrag as any).calls.search;
  assert.equal(calls[0].options.max_results, 10);
});

test("graphrag_search execute: returns JSON-stringified content", async () => {
  const graphrag = makeMockGraphrag(async () => [
    { id: "1", content: "hello world", score: 0.5, metadata: {}, created_at: "" },
  ]);
  const tool = createGraphragSearchTool({ graphrag, context: baseContext });
  const result = await tool.execute("id", { query: "x" }, () => {}, {} as any, {} as any, {} as any);

  assert.equal(result.content.length, 1);
  const firstContent = result.content[0] as { type: "text"; text: string };
  assert.equal(firstContent.type, "text");
  assert.ok(firstContent.text.includes("hello world"));
  assert.equal((result.details as any).count, 1);
});

test("graphrag_search execute: 0 results returns [] in content", async () => {
  const graphrag = makeMockGraphrag(async () => []);
  const tool = createGraphragSearchTool({ graphrag, context: baseContext });
  const result = await tool.execute("id", { query: "x" }, () => {}, {} as any, {} as any, {} as any);

  const firstContent = result.content[0] as { type: "text"; text: string };
  assert.equal(firstContent.text, "[]");
  assert.equal((result.details as any).count, 0);
});

test("graphrag_search execute: scope echoes 'all' when omitted", async () => {
  const graphrag = makeMockGraphrag();
  const tool = createGraphragSearchTool({ graphrag, context: baseContext });
  const result = await tool.execute("id", { query: "x" }, () => {}, {} as any, {} as any, {} as any);

  assert.equal((result.details as any).scope, "all");
});

test("graphrag_search execute: GraphRAGApiError → fallback content (no throw)", async () => {
  const graphrag = makeMockGraphrag(async () => {
    throw new GraphRAGApiError(503, "server_error", "down");
  });
  const tool = createGraphragSearchTool({ graphrag, context: baseContext });
  const result = await tool.execute("id", { query: "x" }, () => {}, {} as any, {} as any, {} as any);

  const firstContent = result.content[0] as { type: "text"; text: string };
  assert.equal(firstContent.text, "doc search unavailable: server_error");
  assert.equal((result.details as any).error, "server_error");
  assert.equal((result.details as any).status, 503);
});

test("graphrag_search execute: 404 not_found fallback content", async () => {
  const graphrag = makeMockGraphrag(async () => {
    throw new GraphRAGApiError(404, "not_found", "scope 'foo' not found");
  });
  const tool = createGraphragSearchTool({ graphrag, context: baseContext });
  const result = await tool.execute(
    "id",
    { query: "x", scope: "foo" },
    () => {},
    {} as any,
    {} as any,
    {} as any,
  );

  const firstContent = result.content[0] as { type: "text"; text: string };
  assert.equal(firstContent.text, "doc search unavailable: not_found");
  assert.equal((result.details as any).scope, "foo");
});

test("graphrag_search execute: network error → fallback", async () => {
  const graphrag = makeMockGraphrag(async () => {
    throw new GraphRAGApiError(0, "network", "down", new Error("ECONNREFUSED"));
  });
  const tool = createGraphragSearchTool({ graphrag, context: baseContext });
  const result = await tool.execute("id", { query: "x" }, () => {}, {} as any, {} as any, {} as any);

  assert.equal((result.details as any).error, "network");
  assert.equal((result.details as any).status, 0);
});

test("graphrag_search execute: unknown error → throws (not caught)", async () => {
  const graphrag = makeMockGraphrag(async () => {
    throw new Error("programmer error");
  });
  const tool = createGraphragSearchTool({ graphrag, context: baseContext });
  await assert.rejects(
    () => tool.execute("id", { query: "x" }, () => {}, {} as any, {} as any, {} as any),
    /programmer error/,
  );
});
