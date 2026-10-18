// Network host policy enforcement for Piko V0.1 tools.
//
// Per docs/91_reviews/v0.1-rfc-network-hosts-enforcement.md (locked
// decision, commit 5ed6cc3):
//
//   * `permissions.network_hosts: []` empty = **no enforcement**
//     (backward-compatible; tools without an allowlist behave as today).
//   * `policyFetch` is installed **per-PiRuntime-instance** at
//     construction time, restored in `PiRuntime.close()`.
//   * No env opt-out. Tests that need bypass call `enterNetworkScope([])`
//     directly.
//
// The module exposes:
//   - `PolicyViolationError` — caught by tool factories and surfaced as
//     fallback content (parallel to `memory unavailable:` /
//     `doc search unavailable:`).
//   - `enterNetworkScope(allowlist)` / `exitNetworkScope()` /
//     `currentAllowlist()` — bracket a tool's execute() call.
//   - `installNetworkPolicy()` / `restoreNetworkPolicy()` —
//     install/uninstall the globalThis.fetch wrapper from PiRuntime's
//     constructor and close().

/**
 * Thrown by the network policy wrapper when the requested URL host
 * is not in the active allowlist, or when the URL itself cannot be
 * parsed. Carries a stable `code` for tests and tool fallback strings.
 */
export class PolicyViolationError extends Error {
  constructor(
    readonly code: "host_not_allowed" | "invalid_request",
    message: string,
    readonly host?: string,
  ) {
    super(message);
    this.name = "PolicyViolationError";
  }
}

// Module-scoped active allowlist. Single PiRuntime instance owns this
// during a tool execute() call. Single-threaded tool calls in V0.1
// mean we don't need a stack.
let activeAllowlist: readonly string[] | null = null;

// Module-scoped prior fetch (the value of globalThis.fetch before the
// policy wrapped it). Used to restore in restoreNetworkPolicy().
let previousFetch: typeof fetch | null = null;

export function currentAllowlist(): readonly string[] | null {
  return activeAllowlist;
}

export function enterNetworkScope(allowlist: readonly string[]): void {
  activeAllowlist = allowlist;
}

export function exitNetworkScope(): void {
  activeAllowlist = null;
}

/**
 * Build a `fetch`-shaped function that validates host against the
 * module-scoped active allowlist before delegating to `base`.
 *
 * Allowlist semantics:
 *   - allowlist `null` (no active scope)            → passthrough
 *   - allowlist `[]`   (active scope, empty list)  → passthrough
 *   - allowlist `["a.com", "b.com"]`               → host must match
 *     one of these exactly (no suffix / no wildcard). Port is
 *     stripped before comparison (`a.com:443` matches `a.com`).
 *
 * Invalid URL   → `PolicyViolationError("invalid_request", ...)`
 * Disallowed host → `PolicyViolationError("host_not_allowed", host, ...)`
 */
export function makePolicyFetch(base: typeof fetch): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const allowlist = activeAllowlist;
    if (allowlist !== null && allowlist.length > 0) {
      const urlString = typeof input === "string" ? input : input.toString();
      let parsed: URL;
      try {
        parsed = new URL(urlString);
      } catch {
        throw new PolicyViolationError(
          "invalid_request",
          `not a URL: ${urlString}`,
        );
      }
      const host = parsed.host.split(":")[0];
      if (!allowlist.includes(host)) {
        throw new PolicyViolationError(
          "host_not_allowed",
          `host ${host} not in policy allowlist`,
          host,
        );
      }
    }
    return base(input as RequestInfo, init);
  }) as typeof fetch;
}

/**
 * Wrap the current `globalThis.fetch` with `makePolicyFetch`,
 * replacing the global. Idempotent: returns the previously-saved
 * fetch without re-installation if already wrapped.
 *
 * Returns the prior `fetch` value (the unwrapped chain), so callers
 * may stash it for diagnostics.
 */
export function installNetworkPolicy(): typeof fetch {
  if (previousFetch !== null) return previousFetch;
  const base = globalThis.fetch;
  previousFetch = base;
  (globalThis as { fetch: typeof fetch }).fetch = makePolicyFetch(base);
  return base;
}

/**
 * Restore `globalThis.fetch` to the prior fetch value and clear the
 * active allowlist. Idempotent — safe to call multiple times.
 */
export function restoreNetworkPolicy(): void {
  if (previousFetch !== null) {
    (globalThis as { fetch: typeof fetch }).fetch = previousFetch;
    previousFetch = null;
  }
  activeAllowlist = null;
}
