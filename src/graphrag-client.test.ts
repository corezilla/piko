// Unit tests for GraphRAGAdapter (Piko Doc Search V0.1)
//
// Per ISD: docs/50_implementation_design/piko-graphrag-impl.isd.md §2.2

import { test } from "node:test";
import assert from "node:assert/strict";
import { GraphRAGAdapter, GraphRAGApiError } from "./graphrag-client.js";

// ============================================================
// Mock fetch helper (mirrors mem0-client.test.ts style)
// ============================================================

interface MockResponse {
  status: number;
  body?: any;
  headers?: Record<string, string>;
}

function mockFetch(responder: (url: string, init: RequestInit) => MockResponse) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fn = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const u = typeof url === "string" ? url : url.toString();
    const i = init ?? {};
    calls.push({ url: u, init: i });
    const r = responder(u, i);
    return new Response(JSON.stringify(r.body ?? {}), {
      status: r.status,
      headers: r.headers ?? new Headers({ "content-type": "application/json" }),
    });
  };
  (fn as any).calls = calls;
  return fn as unknown as typeof fetch & { calls: typeof calls };
}

const BASE = "https://graphrag.example.com";
const KEY = "test-graphrag-key";

function makeAdapter() {
  return new GraphRAGAdapter(BASE, KEY);
}

// ============================================================
// search() tests
// ============================================================

test("search: 200 OK returns GraphRAGSearchResult[]", async () => {
  const adapter = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch((url, init) => {
    // OpenSearch / Elasticsearch _search convention:
    //   POST {baseUrl}/{index}/_search
    //   Body: { size, query: { multi_match: { query, fields, type } } }
    //   Response: { hits: { hits: [{ _id, _score, _source: {...} }] } }
    assert.equal(url, `${BASE}/all/_search`);
    assert.equal(init.method, "POST");
    const headers = init.headers as Record<string, string>;
    assert.equal(headers["Authorization"], `Bearer ${KEY}`);
    assert.equal(headers["Content-Type"], "application/json");
    const body = JSON.parse(init.body as string);
    assert.equal(body.size, 5);
    assert.equal(body.query.multi_match.query, "design of skill memory");
    assert.deepEqual(body.query.multi_match.fields, ["content^2", "title"]);
    assert.equal(body.query.multi_match.type, "best_fields");
    return {
      status: 200,
      body: {
        took: 0,
        hits: {
          total: { value: 1, relation: "eq" },
          max_score: 0.92,
          hits: [
            {
              _index: "_all",
              _id: "doc-1",
              _score: 0.92,
              _source: {
                content: "Piko doc search layer ...",
                metadata: { source: "piko-design-docs" },
                created_at: "2026-10-18T00:00:00Z",
              },
            },
          ],
        },
      },
    };
  }) as typeof fetch;

  const results = await adapter.search("design of skill memory");
  assert.equal(results.length, 1);
  assert.equal(results[0].id, "doc-1");
  assert.equal(results[0].score, 0.92);
  assert.equal(results[0].content, "Piko doc search layer ...");
  globalThis.fetch = origFetch;
});

test("search: forwards scope option to backend as path segment", async () => {
  const adapter = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch((url, _init) => {
    // scope becomes the index in the URL path
    assert.equal(url, `${BASE}/std-templates/_search`);
    return {
      status: 200,
      body: { took: 0, hits: { total: { value: 0, relation: "eq" }, hits: [] } },
    };
  }) as typeof fetch;

  await adapter.search("template", { scope: "std-templates" });
  globalThis.fetch = origFetch;
});

test("search: forwards filters option to backend as bool.filter", async () => {
  const adapter = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch((_url, init) => {
    const body = JSON.parse(init.body as string);
    // piko `filters: { "metadata.section": "design" }` becomes
    // OpenSearch `query.bool.filter: [{ term: { "metadata.section": "design" } }]`
    assert.deepEqual(body.query.bool.filter, [
      { term: { "metadata.section": "design" } },
    ]);
    return {
      status: 200,
      body: { took: 0, hits: { total: { value: 0, relation: "eq" }, hits: [] } },
    };
  }) as typeof fetch;

  await adapter.search("x", { filters: { "metadata.section": "design" } });
  globalThis.fetch = origFetch;
});

test("search: respects max_results option as size", async () => {
  const adapter = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch((_url, init) => {
    const body = JSON.parse(init.body as string);
    // max_results → OpenSearch `size`
    assert.equal(body.size, 20);
    return {
      status: 200,
      body: { took: 0, hits: { total: { value: 0, relation: "eq" }, hits: [] } },
    };
  }) as typeof fetch;

  await adapter.search("x", { max_results: 20 });
  globalThis.fetch = origFetch;
});

test("search: 401 throws GraphRAGApiError code=auth_invalid", async () => {
  const adapter = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(() => ({
    status: 401,
    body: { error: { type: "security_exception", reason: "Invalid API key" } },
  })) as typeof fetch;

  await assert.rejects(
    () => adapter.search("x"),
    (err: unknown) => {
      assert.ok(err instanceof GraphRAGApiError);
      assert.equal((err as GraphRAGApiError).status, 401);
      assert.equal((err as GraphRAGApiError).code, "auth_invalid");
      return true;
    },
  );
  globalThis.fetch = origFetch;
});

test("search: 429 throws GraphRAGApiError code=rate_limited", async () => {
  const adapter = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(() => ({
    status: 429,
    body: { error: { type: "circuit_breaking_exception", reason: "Slow down" } },
  })) as typeof fetch;

  await assert.rejects(
    () => adapter.search("x"),
    (err: unknown) => {
      assert.equal((err as GraphRAGApiError).code, "rate_limited");
      return true;
    },
  );
  globalThis.fetch = origFetch;
});

test("search: 500 throws GraphRAGApiError code=server_error", async () => {
  const adapter = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(() => ({
    status: 500,
    body: { error: { type: "server_error", reason: "oops" } },
  })) as typeof fetch;

  await assert.rejects(
    () => adapter.search("x"),
    (err: unknown) => {
      assert.equal((err as GraphRAGApiError).code, "server_error");
      return true;
    },
  );
  globalThis.fetch = origFetch;
});

test("search: 404 (unknown index) throws GraphRAGApiError code=not_found", async () => {
  const adapter = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(() => ({
    status: 404,
    body: { error: { type: "index_not_found_exception", reason: "no such index [foo]" } },
  })) as typeof fetch;

  await assert.rejects(
    () => adapter.search("x", { scope: "foo" }),
    (err: unknown) => {
      assert.equal((err as GraphRAGApiError).code, "not_found");
      return true;
    },
  );
  globalThis.fetch = origFetch;
});

test("search: network error → code=network status=0", async () => {
  const adapter = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw new TypeError("fetch failed");
  }) as typeof fetch;

  await assert.rejects(
    () => adapter.search("x"),
    (err: unknown) => {
      assert.ok(err instanceof GraphRAGApiError);
      assert.equal((err as GraphRAGApiError).status, 0);
      assert.equal((err as GraphRAGApiError).code, "network");
      return true;
    },
  );
  globalThis.fetch = origFetch;
});

test("search: empty query throws Error", async () => {
  const adapter = makeAdapter();
  await assert.rejects(
    () => adapter.search(""),
    /query required/,
  );
  await assert.rejects(
    () => adapter.search("   "),
    /query required/,
  );
});

test("search: 0 hits returns empty array (not error)", async () => {
  const adapter = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(() => ({
    status: 200,
    body: { took: 0, hits: { total: { value: 0, relation: "eq" }, hits: [] } },
  })) as typeof fetch;

  const results = await adapter.search("nothing matches");
  assert.deepEqual(results, []);
  globalThis.fetch = origFetch;
});

test("search: handles missing fields in hit with defaults", async () => {
  const adapter = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(() => ({
    status: 200,
    body: {
      took: 0,
      hits: {
        total: { value: 1, relation: "eq" },
        hits: [{ /* missing _id, _score, _source */ }],
      },
    },
  })) as typeof fetch;

  const results = await adapter.search("x");
  assert.equal(results[0].id, "");
  assert.equal(results[0].content, "");
  assert.equal(results[0].score, 0);
  assert.deepEqual(results[0].metadata, {});
  assert.equal(results[0].created_at, "");
  globalThis.fetch = origFetch;
});
