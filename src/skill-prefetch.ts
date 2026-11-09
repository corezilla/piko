/**
 * V0.1.3 · skill auto-prefetch at task start.
 *
 * V0.1 / V0.1.1 / V0.1.2 treated skills as LLM-driven: the system prompt
 * listed `mem0_lookup` / `graphrag_search` and told the agent to use them.
 * That relies on the model deciding to call a tool on its own, and a small
 * local model does not. The tools were wired and the adapters were correct,
 * but the agent never used them -- so "skills are usable" was never actually
 * proven end to end.
 *
 * V0.1.3 makes the context automatic: before the agent's first turn, piko
 * searches prior experience and the project docs for THIS task's
 * instruction and injects what it finds into the system prompt. The tools
 * stay available for additional mid-task queries.
 *
 * Two properties matter and are enforced here:
 *
 *  1. Prefetch NEVER blocks the task. A slow, broken, or absent backend
 *     yields an empty section, not an error. The function does not throw.
 *  2. Prefetch NEVER invents context. An empty result renders as "0 found",
 *     never as a plausible-looking fabrication.
 *
 * Per design: docs/91_reviews/piko-skill-auto-prefetch-decision.md §2-4
 */

import type { Mem0Adapter, Mem0SearchResult } from "./mem0-client.js";
import type { GraphRAGAdapter, GraphRAGSearchResult } from "./graphrag-client.js";

/** Default per-backend budget. The two run in parallel, so total startup
 *  cost is one timeout, not two. */
export const DEFAULT_PREFETCH_TIMEOUT_MS = 1500;

/** How many entries each backend contributes. */
export const DEFAULT_PREFETCH_MAX_RESULTS = 5;

/** The search query is capped so a huge instruction cannot blow up the
 *  backend's request. */
export const MAX_QUERY_CHARS = 500;

/** How much of one entry is rendered into the prompt. */
export const MAX_ENTRY_CHARS = 200;

/** Identity scope for the prefetch. */
export interface PrefetchIdentity {
  /** Role, e.g. "tester". */
  role: string;
  /** Mem0 user id: the project's `${role}:${project}` convention. */
  userId: string;
  /** GraphRAG scope: the operator's default corpus. */
  defaultScope: string;
}

export interface PrefetchedSkillContext {
  /** Prior experience entries. */
  memory: Mem0SearchResult[];
  /** Project doc entries. */
  docs: GraphRAGSearchResult[];
  /** The query actually sent to each backend (after capping). */
  memoryQuery: string;
  docsQuery: string;
  /** Why the prefetch was skipped, if it was. */
  skipped?: string;
  /** Which backends were consulted vs. unavailable. */
  sources: {
    memory: "ok" | "empty" | "unavailable" | "skipped";
    docs: "ok" | "empty" | "unavailable" | "skipped";
  };
  /** How long the prefetch took, in ms. */
  durationMs: number;
}

/** Why a prefetch was bypassed. */
export type PrefetchSkipReason =
  | "short_instruction"
  | "disabled"
  | "no_skill"
  | "no_identity"
  | "no_backends";

export interface PrefetchOptions {
  timeoutMs?: number;
  maxResults?: number;
  /** Operator/task-level override to skip prefetch entirely. */
  disabled?: boolean;
  /** Task kind that needs no project context (compute / pure IO). */
  kind?: string;
  /** Minimum instruction length. Shorter is treated as trivial. */
  minInstructionLength?: number;
  /** Bypass the process-scoped cache for this call. */
  noCache?: boolean;
}

// ---------------------------------------------------------------- cache

/**
 * Process-scoped LRU cache of prefetched contexts.
 *
 * Keyed on the IDENTITY SCOPE (role, user_id, defaultScope), not on the
 * query: the agent's iteration over the same identity is the unit, and the
 * same role working a second task should not pay the latency again.
 *
 * The cached value is the context for the MOST RECENT query under that key.
 * A different instruction replaces it -- the context is re-fetched so it
 * matches the current task.
 *
 * A cached entry is only reused when the incoming query matches the one it
 * was fetched for. That keeps the cache honest: it saves the repeated
 * latency of the same task shape without serving yesterday's context for
 * today's question.
 */
const CACHE_LIMIT = 32;
const cache = new Map<string, { query: string; context: PrefetchedSkillContext }>();

/**
 * The cache key for an identity: role, user and default scope.
 *
 * Exported so the key derivation can be asserted directly.
 */
export function cacheKey(identity: PrefetchIdentity): string {
  return `${identity.role}|${identity.userId}|${identity.defaultScope}`;
}

/** Drop every cached context. Exported for tests and for operator resets. */
export function clearPrefetchCache(): void {
  cache.clear();
}

/** Current number of cached contexts. Exported for tests. */
export function prefetchCacheSize(): number {
  return cache.size;
}

/**
 * Fetch prior experience and project docs for a task, in parallel, with a
 * per-backend timeout.
 *
 * Never throws. Every failure mode degrades to an empty section:
 *   - both backends unreachable -> memory: [], docs: []
 *   - one backend unreachable   -> the other still serves
 *   - a backend is slow         -> it times out, the other still serves
 */
export async function prefetchSkillContext(
  query: string,
  identity: PrefetchIdentity | undefined,
  mem0: Mem0Adapter | undefined,
  graphrag: GraphRAGAdapter | undefined,
  opts: PrefetchOptions = {},
): Promise<PrefetchedSkillContext> {
  const startedAt = Date.now();
  const timeoutMs = opts.timeoutMs ?? DEFAULT_PREFETCH_TIMEOUT_MS;
  const maxResults = opts.maxResults ?? DEFAULT_PREFETCH_MAX_RESULTS;
  const minLength = opts.minInstructionLength ?? 20;

  const empty = (skipped: PrefetchSkipReason): PrefetchedSkillContext => ({
    memory: [],
    docs: [],
    memoryQuery: "",
    docsQuery: "",
    skipped,
    sources: { memory: "skipped", docs: "skipped" },
    durationMs: Date.now() - startedAt,
  });

  if (opts.disabled) return empty("disabled");
  if (opts.kind === "no_skill") return empty("no_skill");
  if (!query || query.trim().length < minLength) return empty("short_instruction");
  if (!identity) return empty("no_identity");
  if (!mem0 && !graphrag) return empty("no_backends");

  const capped = query.slice(0, MAX_QUERY_CHARS);

  // Cache hit: same scope, same query. The backends are not contacted.
  const key = cacheKey(identity);
  if (!opts.noCache) {
    const hit = cache.get(key);
    if (hit && hit.query === capped) {
      // Refresh recency: this is the most-recently-used entry for the key.
      cache.delete(key);
      cache.set(key, hit);
      return { ...hit.context, durationMs: Date.now() - startedAt };
    }
  }

  // Promise.allSettled, not all: one backend failing must not discard the
  // other's result.
  const [memoryOutcome, docsOutcome] = await Promise.allSettled([
    mem0 ? withTimeout(mem0.search(capped, identity.userId, { max_results: maxResults }), timeoutMs) : Promise.resolve([] as Mem0SearchResult[]),
    graphrag
      ? withTimeout(graphrag.search(capped, { scope: identity.defaultScope, max_results: maxResults }), timeoutMs)
      : Promise.resolve([] as GraphRAGSearchResult[]),
  ]);

  const memory = memoryOutcome.status === "fulfilled" ? memoryOutcome.value : [];
  const docs = docsOutcome.status === "fulfilled" ? docsOutcome.value : [];

  const context: PrefetchedSkillContext = {
    memory,
    docs,
    memoryQuery: capped,
    docsQuery: capped,
    sources: {
      memory: !mem0 ? "skipped" : memoryOutcome.status === "fulfilled" ? (memory.length > 0 ? "ok" : "empty") : "unavailable",
      docs: !graphrag ? "skipped" : docsOutcome.status === "fulfilled" ? (docs.length > 0 ? "ok" : "empty") : "unavailable",
    },
    durationMs: Date.now() - startedAt,
  };

  // A fetch in which every CONFIGURED backend failed is NOT cached: the next
  // task should retry rather than inherit a "backend down" verdict for the
  // rest of the process's life. A backend that is simply not configured is
  // "skipped", not "failed" -- it does not make the fetch a failure.
  const configured = [context.sources.memory, context.sources.docs].filter((s) => s !== "skipped");
  const allFailed = configured.length > 0 && configured.every((s) => s === "unavailable");
  if (!opts.noCache && !allFailed) {
    cache.delete(key);
    cache.set(key, { query: capped, context });
    while (cache.size > CACHE_LIMIT) {
      const oldest = cache.keys().next().value;
      if (oldest === undefined) break;
      cache.delete(oldest);
    }
  }

  return context;
}

/**
 * Reject a promise that does not settle within `ms`.
 *
 * The underlying request is NOT aborted -- the adapters have no cancellation
 * -- so a timed-out backend may still answer later. That is fine: the
 * prefetch has already moved on, and the late result is discarded.
 */
/**
 * Reject a promise that does not settle within `ms`.
 *
 * Exported so the timeout behaviour can be asserted directly.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`prefetch timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}

/** One prior-experience entry, rendered for the prompt. */
export function renderMemoryEntry(entry: Mem0SearchResult): string {
  const text = (entry.memory ?? "").slice(0, MAX_ENTRY_CHARS);
  const date = entry.created_at ? entry.created_at.slice(0, 10) : "";
  const tags = Array.isArray(entry.metadata?.tags) ? entry.metadata.tags.join(", ") : "";
  const suffix = [date, tags].filter(Boolean).join(", ");
  return suffix ? `- "${text}" (${suffix})` : `- "${text}"`;
}

/** One project-doc entry, rendered for the prompt. */
export function renderDocEntry(entry: GraphRAGSearchResult): string {
  const text = (entry.content ?? "").slice(0, MAX_ENTRY_CHARS);
  const source = entry.metadata?.source ?? entry.metadata?.path ?? entry.id;
  return source ? `- ${source}: ${text}` : `- ${text}`;
}

/**
 * Render the `=== Context ===` section for the system prompt.
 *
 * The section is ALWAYS emitted when a context object is provided, even when
 * empty, so the prompt shape stays constant -- the model sees "0 found"
 * rather than a section that silently appears and disappears between tasks.
 */
export function renderSkillContext(context: PrefetchedSkillContext): string {
  const parts: string[] = [];

  if (context.skipped) {
    parts.push(`\n=== Context ===\n(skipped: ${context.skipped})`);
    return parts.join("");
  }

  const memoryLines =
    context.memory.length > 0
      ? context.memory.map(renderMemoryEntry)
      : [context.sources.memory === "unavailable" ? "- (prior experience unavailable)" : "- (no prior experience found)"];
  const docLines =
    context.docs.length > 0
      ? context.docs.map(renderDocEntry)
      : [context.sources.docs === "unavailable" ? "- (project docs unavailable)" : "- (no project docs found)"];

  parts.push(
    `\n=== Context ===` +
      `\n--- Prior experience (${context.memory.length} found) ---` +
      `\n${memoryLines.join("\n")}` +
      `\n--- Project docs (${context.docs.length} found) ---` +
      `\n${docLines.join("\n")}`,
  );
  return parts.join("");
}
