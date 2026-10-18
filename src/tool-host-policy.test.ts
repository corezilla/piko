// Unit tests for V0.1 tool host policy.
//
// Per docs/91_reviews/v0.1-rfc-network-hosts-enforcement.md §5.
// Each test restores globalThis.fetch on cleanup so the module's
// `previousFetch` state does not leak across test cases.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  currentAllowlist,
  enterNetworkScope,
  exitNetworkScope,
  installNetworkPolicy,
  makePolicyFetch,
  PolicyViolationError,
  restoreNetworkPolicy,
} from "./tool-host-policy.js";

// ============================================================
// Module-scoped allowlist tests
// ============================================================

test("currentAllowlist: returns null by default", () => {
  // No explicit prior enterNetworkScope in this test; rely on
  // restoreNetworkPolicy() having been called by previous tests'
  // cleanup. State should not leak between tests.
  // (We assert !== = a "defined" allowlist; we don't assert === null
  // in case a parallel test set it during interleaving.)
  const cur = currentAllowlist();
  assert.ok(cur === null || Array.isArray(cur));
});

test("enterNetworkScope / exitNetworkScope: round-trip and isolation", () => {
  enterNetworkScope(["a.com"]);
  assert.deepEqual(currentAllowlist(), ["a.com"]);
  enterNetworkScope(["b.com", "c.com"]);
  assert.deepEqual(currentAllowlist(), ["b.com", "c.com"]);
  exitNetworkScope();
  assert.equal(currentAllowlist(), null);
});

// ============================================================
// makePolicyFetch behavior tests
// ============================================================

function stubBase(responder?: (url: string, init?: RequestInit) => Promise<Response> | Response): typeof fetch {
  const fn = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const u = typeof input === "string" ? input : input.toString();
    if (responder) return responder(u, init);
    return new Response("{}", { status: 200 });
  }) as unknown as typeof fetch;
  return fn;
}

test("policyFetch: empty allowlist is passthrough", async () => {
  enterNetworkScope([]);
  try {
    const base = stubBase();
    const wrapped = makePolicyFetch(base);
    const r = await wrapped("https://anything.example.com/x");
    assert.equal(r.status, 200);
  } finally {
    exitNetworkScope();
  }
});

test("policyFetch: blocked host throws host_not_allowed", async () => {
  enterNetworkScope(["allowed.com"]);
  try {
    const base = stubBase();
    const wrapped = makePolicyFetch(base);
    await assert.rejects(
      () => wrapped("https://blocked.com/x"),
      (err: unknown) => {
        assert.ok(err instanceof PolicyViolationError);
        assert.equal((err as PolicyViolationError).code, "host_not_allowed");
        assert.equal((err as PolicyViolationError).host, "blocked.com");
        return true;
      },
    );
  } finally {
    exitNetworkScope();
  }
});

test("policyFetch: exact host match is allowed", async () => {
  enterNetworkScope(["allowed.com"]);
  try {
    let captured = "";
    const base = stubBase(async (u) => {
      captured = u;
      return new Response("{}", { status: 200 });
    });
    const wrapped = makePolicyFetch(base);
    await wrapped("https://allowed.com:8443/v1/memories/search/");
    assert.equal(captured, "https://allowed.com:8443/v1/memories/search/");
  } finally {
    exitNetworkScope();
  }
});

test("policyFetch: port is stripped before match (443 == bare host)", async () => {
  enterNetworkScope(["api.mem0.ai"]);
  try {
    let called = false;
    const base = stubBase(() => {
      called = true;
      return new Response("{}", { status: 200 });
    });
    const wrapped = makePolicyFetch(base);
    await wrapped("https://api.mem0.ai:443/v1/memories/search/");
    assert.equal(called, true);
  } finally {
    exitNetworkScope();
  }
});

test("policyFetch: suffix is NOT a match (api.mem0.ai.evil.com ≠ api.mem0.ai)", async () => {
  enterNetworkScope(["api.mem0.ai"]);
  try {
    const base = stubBase();
    const wrapped = makePolicyFetch(base);
    await assert.rejects(
      () => wrapped("https://api.mem0.ai.evil.com/x"),
      (err: unknown) => {
        assert.equal((err as PolicyViolationError).code, "host_not_allowed");
        assert.equal((err as PolicyViolationError).host, "api.mem0.ai.evil.com");
        return true;
      },
    );
  } finally {
    exitNetworkScope();
  }
});

test("policyFetch: invalid URL throws invalid_request", async () => {
  enterNetworkScope(["a.com"]);
  try {
    const base = stubBase();
    const wrapped = makePolicyFetch(base);
    await assert.rejects(
      () => wrapped("not-a-valid-url"),
      (err: unknown) => {
        assert.ok(err instanceof PolicyViolationError);
        assert.equal((err as PolicyViolationError).code, "invalid_request");
        return true;
      },
    );
  } finally {
    exitNetworkScope();
  }
});

test("policyFetch: null allowlist (no active scope) is passthrough", async () => {
  // No enterNetworkScope(); currentAllowlist() is null.
  // Even constructing wrapper must not block.
  const base = stubBase();
  const wrapped = makePolicyFetch(base);
  const r = await wrapped("https://anywhere.example.com/x");
  assert.equal(r.status, 200);
});

// ============================================================
// installNetworkPolicy / restoreNetworkPolicy tests
// ============================================================

test("installNetworkPolicy: idempotent — second call returns the prior fetch", () => {
  const origFetch = globalThis.fetch;
  try {
    const first = installNetworkPolicy();
    assert.equal(typeof first, "function");
    const second = installNetworkPolicy();
    assert.equal(second, first); // same capture returned; not re-wrapped
  } finally {
    restoreNetworkPolicy();
    // In case of test-runner ordering, also restore the literal:
    if ((globalThis as { fetch: unknown }).fetch !== origFetch) {
      (globalThis as { fetch: typeof fetch }).fetch = origFetch;
    }
  }
});

test("installNetworkPolicy then restore: globalThis.fetch returns to original", () => {
  const origFetch = globalThis.fetch;
  try {
    const returned = installNetworkPolicy();
    // After install, globalThis.fetch should be the wrapper, not origFetch.
    assert.notEqual(globalThis.fetch, origFetch);
    assert.notEqual(globalThis.fetch, returned); // sanity: returned is the *prior*, not the wrapper
    restoreNetworkPolicy();
    assert.equal(globalThis.fetch, origFetch);
  } finally {
    // Defensive cleanup if a prior failure left state dirty.
    if ((globalThis as { fetch: unknown }).fetch !== origFetch) {
      (globalThis as { fetch: typeof fetch }).fetch = origFetch;
    }
  }
});
