// Unit tests for Mem0Adapter (Piko Skill Experience V0.1)
//
// Per ISD: docs/50_implementation_design/piko-mem0-client-impl.isd.md §2.2

import { test } from "node:test";
import assert from "node:assert/strict";
import { Mem0Adapter, Mem0ApiError } from "./mem0-client.js";

// ============================================================
// Mock fetch helper
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

const BASE = "https://api.mem0.ai";
const KEY = "test-key";

function makeAdapter() {
  return new Mem0Adapter(BASE, KEY);
}

// ============================================================
// search() tests
// ============================================================

test("search: 200 OK returns Mem0SearchResult[]", async () => {
  const mem0 = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch((url, init) => {
    assert.equal(url, `${BASE}/v1/memories/search/`);
    assert.equal(init.method, "POST");
    const headers = init.headers as Record<string, string>;
    assert.equal(headers["Authorization"], `Bearer ${KEY}`);
    const body = JSON.parse(init.body as string);
    assert.equal(body.query, "auth boundary");
    assert.equal(body.user_id, "tester:piko");
    assert.equal(body.limit, 5);
    return {
      status: 200,
      body: {
        results: [
          {
            id: "mem-1",
            memory: "Lesson text",
            score: 0.85,
            metadata: { type: "skill_experience" },
            created_at: "2026-10-18T00:00:00Z",
          },
        ],
      },
    };
  }) as typeof fetch;

  const results = await mem0.search("auth boundary", "tester:piko");
  assert.equal(results.length, 1);
  assert.equal(results[0].id, "mem-1");
  assert.equal(results[0].score, 0.85);
  globalThis.fetch = origFetch;
});

test("search: respects max_results option", async () => {
  const mem0 = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch((_url, init) => {
    const body = JSON.parse(init.body as string);
    assert.equal(body.limit, 20);
    return { status: 200, body: { results: [] } };
  }) as typeof fetch;

  await mem0.search("x", "tester:piko", { max_results: 20 });
  globalThis.fetch = origFetch;
});

test("search: respects filters option", async () => {
  const mem0 = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch((_url, init) => {
    const body = JSON.parse(init.body as string);
    assert.deepEqual(body.filters, { "metadata.type": "skill_experience" });
    return { status: 200, body: { results: [] } };
  }) as typeof fetch;

  await mem0.search("x", "tester:piko", { filters: { "metadata.type": "skill_experience" } });
  globalThis.fetch = origFetch;
});

test("search: 401 throws Mem0ApiError code=auth_invalid", async () => {
  const mem0 = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(() => ({
    status: 401,
    body: { message: "Invalid API key" },
  })) as typeof fetch;

  await assert.rejects(
    () => mem0.search("x", "tester:piko"),
    (err: unknown) => {
      assert.ok(err instanceof Mem0ApiError);
      assert.equal((err as Mem0ApiError).status, 401);
      assert.equal((err as Mem0ApiError).code, "auth_invalid");
      return true;
    },
  );
  globalThis.fetch = origFetch;
});

test("search: 429 throws Mem0ApiError code=rate_limited", async () => {
  const mem0 = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(() => ({ status: 429, body: { message: "Slow down" } })) as typeof fetch;

  await assert.rejects(
    () => mem0.search("x", "tester:piko"),
    (err: unknown) => {
      assert.equal((err as Mem0ApiError).code, "rate_limited");
      return true;
    },
  );
  globalThis.fetch = origFetch;
});

test("search: 500 throws Mem0ApiError code=server_error", async () => {
  const mem0 = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(() => ({ status: 500, body: {} })) as typeof fetch;

  await assert.rejects(
    () => mem0.search("x", "tester:piko"),
    (err: unknown) => {
      assert.equal((err as Mem0ApiError).code, "server_error");
      return true;
    },
  );
  globalThis.fetch = origFetch;
});

test("search: network error → code=network status=0", async () => {
  const mem0 = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw new TypeError("fetch failed");
  }) as typeof fetch;

  await assert.rejects(
    () => mem0.search("x", "tester:piko"),
    (err: unknown) => {
      assert.ok(err instanceof Mem0ApiError);
      assert.equal((err as Mem0ApiError).status, 0);
      assert.equal((err as Mem0ApiError).code, "network");
      return true;
    },
  );
  globalThis.fetch = origFetch;
});

test("search: empty user_id throws Error", async () => {
  const mem0 = makeAdapter();
  await assert.rejects(
    () => mem0.search("x", ""),
    /user_id required/,
  );
});

test("search: 0 results returns empty array (not error)", async () => {
  const mem0 = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(() => ({ status: 200, body: { results: [] } })) as typeof fetch;

  const results = await mem0.search("nonexistent", "tester:piko");
  assert.deepEqual(results, []);
  globalThis.fetch = origFetch;
});

test("search: handles missing fields in result with defaults", async () => {
  const mem0 = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(() => ({
    status: 200,
    body: {
      results: [
        { /* empty object */ },
      ],
    },
  })) as typeof fetch;

  const results = await mem0.search("x", "tester:piko");
  assert.equal(results[0].id, "");
  assert.equal(results[0].memory, "");
  assert.equal(results[0].score, 0);
  globalThis.fetch = origFetch;
});

// ============================================================
// add() tests
// ============================================================

test("add: 200 OK returns ids array", async () => {
  const mem0 = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFetch((url, init) => {
    assert.equal(url, `${BASE}/v1/memories/`);
    const body = JSON.parse(init.body as string);
    assert.equal(body.infer, true);
    assert.equal(body.user_id, "tester:piko");
    assert.deepEqual(body.messages, [{ role: "user", content: "lesson" }]);
    assert.deepEqual(body.metadata, { type: "skill_experience" });
    return { status: 200, body: { results: [{ id: "mem-new-1" }] } };
  }) as typeof fetch;

  const result = await mem0.add(
    [{ role: "user", content: "lesson" }],
    "tester:piko",
    { type: "skill_experience" },
  );
  assert.deepEqual(result.ids, ["mem-new-1"]);
  globalThis.fetch = origFetch;
});

test("add: empty messages throws Error", async () => {
  const mem0 = makeAdapter();
  await assert.rejects(
    () => mem0.add([], "tester:piko"),
    /messages must be non-empty/,
  );
});

test("add: empty user_id throws Error", async () => {
  const mem0 = makeAdapter();
  await assert.rejects(
    () => mem0.add([{ role: "user", content: "x" }], ""),
    /user_id required/,
  );
});

test("add: network error throws Mem0ApiError code=network", async () => {
  const mem0 = makeAdapter();
  const origFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw new Error("ECONNREFUSED");
  }) as typeof fetch;

  await assert.rejects(
    () => mem0.add([{ role: "user", content: "x" }], "tester:piko"),
    (err: unknown) => {
      assert.ok(err instanceof Mem0ApiError);
      assert.equal((err as Mem0ApiError).code, "network");
      return true;
    },
  );
  globalThis.fetch = origFetch;
});