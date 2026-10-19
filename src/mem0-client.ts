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

    // 3. v3: request body wraps user_id inside `filters`, no top-level user_id
    const body = {
      query,
      filters: {
        user_id,
        ...(options?.filters ?? {}),
      },
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
        results?: Array<Partial<Mem0SearchResult>>;
      };
      const results = data.results ?? [];
      return results.map((r) => ({
        id: r.id ?? "",
        memory: r.memory ?? "",
        score: typeof r.score === "number" ? r.score : 0,
        metadata: r.metadata ?? {},
        created_at: r.created_at ?? "",
      }));
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

    // 3. v3: request body wraps user_id inside `filters` (same convention as search)
    const body = {
      messages,
      filters: {
        user_id,
      },
      metadata: metadata ?? {},
      infer: true,
    };

    // 4. v3: Token + /v3 path
    const url = `${this.baseUrl}/v3/memories/`;
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

    // 6. 处理响应
    if (response.ok) {
      const data = (await response.json()) as {
        results?: Array<{ id?: string }>;
      };
      const ids = (data.results ?? []).map((r) => r.id ?? "");
      return { ids };
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
}