// Mem0 HTTP client wrapper for Piko Skill Experience System V0.1.1
//
// Per design: docs/20_system_design/mechanisms/piko-skill-memory.md
// Per ISD: docs/50_implementation_design/piko-mem0-client-impl.isd.md §11
//
// V0.1.1 update (commit pending): Mem0 Cloud migrated to v3 API.
//   - Endpoint base path: /v3/memories/  (was /v1/memories/)
//   - Auth header format: Authorization: Token <key>  (was Bearer)
//   - search body: { query, filters: { user_id }, top_k }
//                  (was { query, user_id, limit, filters })
//   - add body:    { messages, filters: { user_id }, metadata, infer }
//                  (was { messages, user_id, metadata, infer })
// V0.1 (legacy) v1 fields are kept in the response-mapping path for
// back-compat with the unit tests, but the request side is v3-only.
// A failed v1 401 was confirmed on 2026-10-19 to come from the
// gateway's djangorestframework-simplejwt middleware that tries to
// parse opaque keys as JWTs — switching to Token + v3 path resolves.

/**
 * Custom error for Mem0 HTTP API failures.
 * Carries HTTP status (0 for network-layer errors) and a semantic code.
 */
export class Mem0ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "Mem0ApiError";
  }
}

/** One search result returned by Mem0. */
export interface Mem0SearchResult {
  id: string;
  memory: string;
  score: number;
  metadata: Record<string, any>;
  created_at: string;
}

/** Result of add(): the IDs of newly created memories. */
export interface Mem0AddResult {
  ids: string[];
}

/** Options for search(). */
export interface Mem0SearchOptions {
  /** Maximum number of results. Caller is responsible for [1, 20] bound (schema-enforced). */
  max_results?: number;
  /** Mem0 metadata filter expression. Forwarded as-is. */
  filters?: Record<string, any>;
}

/** Map HTTP status code to semantic error code. */
function mapStatusToCode(status: number): string {
  if (status === 401) return "auth_invalid";
  if (status === 403) return "auth_forbidden";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  if (status >= 500 && status < 600) return "server_error";
  // 其他 4xx 也归 server_error（client bug，归 user 修）
  return "server_error";
}

/**
 * Stateless HTTP client for Mem0 Cloud or self-hosted.
 * Construct one per process; share across tasks safely.
 */
export class Mem0Adapter {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  /**
   * Search Mem0 for relevant memories.
   *
   * @param query Non-empty natural language query (1-500 chars).
   * @param user_id Non-empty Mem0 user ID (typically `${role}:${project}`).
   * @param options Optional max_results / filters.
   * @returns Array of matching memories, sorted by score desc. Empty array = no matches.
   * @throws Error if user_id is empty.
   * @throws Mem0ApiError on HTTP 4xx/5xx or network failure.
   */
  async search(
    query: string,
    user_id: string,
    options?: Mem0SearchOptions,
  ): Promise<Mem0SearchResult[]> {
    // 1. 校验 user_id
    if (!user_id || user_id.trim() === "") {
      throw new Error("user_id required");
    }

    // 2. 计算 maxResults
    const maxResults = options?.max_results ?? 5;

    // 3. v3: search body — filters wrap the entity_id; allowed keys
    //    are: agent_id, app_id, categories, created_at, keywords,
    //    memory_ids, memory_type, run_id, user_id, plus AND/NOT/OR
    //    combinators. Mem0 v3 rejects `metadata.X` flat keys with
    //    "Unknown filter key 'metadata.X'"; we translate them into
    //    v3's nested form (`metadata: { X: ... }`) and `metadata.tags`
    //    gets mapped to `categories.contains` since v3 separates
    //    categories from arbitrary metadata.
    const userFilters = options?.filters ?? {};
    const translatedFilters: Record<string, any> = { user_id, ...userFilters };
    if (translatedFilters["metadata.tags"] !== undefined) {
      const tagVal = translatedFilters["metadata.tags"];
      translatedFilters.categories = { contains: tagVal };
      delete translatedFilters["metadata.tags"];
    }
    for (const [k, v] of Object.entries(translatedFilters)) {
      if (k.startsWith("metadata.") && k !== "metadata.tags") {
        const subKey = k.slice("metadata.".length);
        translatedFilters.metadata = translatedFilters.metadata ?? {};
        translatedFilters.metadata[subKey] = v;
        delete translatedFilters[k];
      }
    }
    const body = {
      query,
      filters: translatedFilters,
      top_k: maxResults,
    };

    // 4. v3: Token auth header (mem0 Cloud's gateway runs djangorestframework-simplejwt
    //    and rejects opaque keys sent as `Authorization: Bearer ...` as invalid JWTs)
    const url = `${this.baseUrl}/v3/memories/search/`;
    const init: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Token ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };

    // 5. 发起 fetch（catch 抛 Mem0ApiError(0, "network")）
    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (err) {
      throw new Mem0ApiError(0, "network", `search failed: ${err}`, err);
    }

    // 6. 处理响应
    if (response.ok) {
      const data = (await response.json()) as {
        results?: Array<{
          id?: string;
          memory?: string;
          score?: number;
          metadata?: Record<string, any>;
          created_at?: string;
          categories?: string[];
        }>;
      };
      const results = data.results ?? [];
      // Synthesize the v1-style `metadata.tags` shape from v3's
      // top-level `categories` array so callers (e.g. day-1 verify)
      // that read `result.metadata.tags.includes(...)` keep working.
      return results.map((r) => {
        const meta = { ...(r.metadata ?? {}) } as Record<string, any>;
        if (r.categories && r.categories.length > 0) {
          meta.tags = r.categories;
        }
        return {
          id: r.id ?? "",
          memory: r.memory ?? "",
          score: typeof r.score === "number" ? r.score : 0,
          metadata: meta,
          created_at: r.created_at ?? "",
        };
      });
    }

    // 7. 非 2xx：抛 Mem0ApiError
    const code = mapStatusToCode(response.status);
    let errMessage = response.statusText;
    try {
      const errBody = (await response.json()) as { message?: string };
      if (errBody.message) errMessage = errBody.message;
    } catch {
      // ignore JSON parse failure, use statusText
    }
    throw new Mem0ApiError(response.status, code, errMessage);
  }

  /**
   * Add a memory entry; Mem0 performs fact extraction.
   *
   * @param messages Non-empty array of user/assistant turns.
   * @param user_id Non-empty Mem0 user ID.
   * @param metadata Optional metadata (typically type/role/task_id/tags).
   * @returns IDs of newly created memories.
   * @throws Error if user_id or messages invalid.
   * @throws Mem0ApiError on HTTP 4xx/5xx or network failure.
   */
  async add(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    user_id: string,
    metadata?: Record<string, any>,
  ): Promise<Mem0AddResult> {
    // 1. 校验 user_id
    if (!user_id || user_id.trim() === "") {
      throw new Error("user_id required");
    }

    // 2. 校验 messages
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("messages must be non-empty");
    }

    // 3. v3: add endpoint uses top-level user_id (NOT inside filters;
    //    that's a search-only convention). v3 also has dedicated
    //    top-level `categories` (string array) — we map the legacy
    //    `metadata.tags` array (if present) onto it so that v3's
    //    `categories.contains` search filter can find the entry.
    const tags = (metadata as { tags?: string[] } | undefined)?.tags;
    const body: Record<string, any> = {
      messages,
      user_id,
      infer: true,
    };
    if (tags && tags.length > 0) {
      body.categories = tags;
    }

    // 4. v3: Token + /v3/memories/add/ (note: distinct from /v3/memories/,
    //    which is a search-only endpoint in v3; add is its own path)
    const url = `${this.baseUrl}/v3/memories/add/`;
    const init: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Token ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };

    // 5. 发起 fetch
    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (err) {
      throw new Mem0ApiError(0, "network", `add failed: ${err}`, err);
    }

    // 6. v3: response is async — returns { event_id, status: "PENDING"|... }
    //    since fact extraction runs in the background. The day-1 verifier
    //    (and skill-tools.ts callers) expect `ids[0]` to be the actual
    //    memory id they can correlate via a follow-up search. We poll the
    //    search endpoint up to 10s waiting for the LLM to extract and the
    //    just-added entry to become queryable; if it doesn't appear we
    //    fall back to the event_id (caller's find-by-id will then fail,
    //    which is the correct signal of "extraction didn't complete in
    //    time").
    if (response.ok) {
      const data = (await response.json()) as {
        event_id?: string;
        status?: string;
      };
      const eventId = data.event_id ?? "";
      if (eventId) {
        const memoryId = await this.pollForExtractedMemory(
          user_id,
          String(messages[0]?.content ?? "").slice(0, 80),
        );
        return { ids: [memoryId ?? eventId] };
      }
      return { ids: [] };
    }

    // 7. 非 2xx
    const code = mapStatusToCode(response.status);
    let errMessage = response.statusText;
    try {
      const errBody = (await response.json()) as { message?: string };
      if (errBody.message) errMessage = errBody.message;
    } catch {
      // ignore
    }
    throw new Mem0ApiError(response.status, code, errMessage);
  }

  /**
   * After a v3 add() (which returns an async event_id), poll the search
   * endpoint until the just-added memory becomes queryable. v3's LLM
   * fact extraction runs server-side and may take several seconds; we
   * bound the wait at 10s and return the most recently created memory
   * id that matches `user_id` and `query` (a slice of the original
   * message). Returns null on timeout — caller falls back to the
   * event_id, which will fail any follow-up find-by-id lookup.
   */
  private async pollForExtractedMemory(
    user_id: string,
    query: string,
  ): Promise<string | null> {
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline) {
      try {
        const hits = await this.search(query || " ", user_id, { max_results: 5 });
        if (hits.length > 0) {
          // Take the most recently created entry
          const sorted = hits
            .slice()
            .sort((a, b) =>
              (b.created_at ?? "").localeCompare(a.created_at ?? ""),
            );
          if (sorted[0]?.id) return sorted[0].id;
        }
      } catch {
        /* ignore transient poll errors, try again */
      }
      await new Promise((r) => setTimeout(r, 700));
    }
    return null;
  }
}