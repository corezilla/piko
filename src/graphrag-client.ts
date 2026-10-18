// GraphRAG-style document search HTTP client wrapper for Piko Doc Search V0.1
//
// Per design: docs/20_system_design/mechanisms/piko-doc-search.md
// Per ISD: docs/50_implementation_design/piko-graphrag-impl.isd.md §11
//
// Thin HTTP wrapper around an externalized doc-corpus search service. The
// API contract (POST {base_url}/v1/search) is defined per the mechanism doc;
// the actual backend is operator-deployed (no off-the-shelf GraphRAG Cloud
// vendor is universally available in 2026).

/**
 * Custom error for GraphRAG HTTP API failures.
 * Carries HTTP status (0 for network-layer errors) and a semantic code.
 */
export class GraphRAGApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "GraphRAGApiError";
  }
}

/** One search result returned by the GraphRAG backend. */
export interface GraphRAGSearchResult {
  id: string;
  /** Result body text. Backend-defined; typically the matched chunk content. */
  content: string;
  score: number;
  metadata: Record<string, any>;
  created_at: string;
}

/** Options for search(). */
export interface GraphRAGSearchOptions {
  /** Corpus scope identifier. Backend-defined (e.g. "piko-design-docs",
   *  "std-templates", "all"). Defaults to "all" on the wire when omitted. */
  scope?: string;
  /** Backend-defined filter expression. Forwarded as-is. */
  filters?: Record<string, any>;
  /** Maximum results. Caller is responsible for the [1, 20] bound (schema-enforced). */
  max_results?: number;
}

/** Map HTTP status code to semantic error code. */
function mapStatusToCode(status: number): string {
  if (status === 401) return "auth_invalid";
  if (status === 403) return "auth_forbidden";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  if (status >= 500 && status < 600) return "server_error";
  // 其他 4xx 也归 server_error（client bug，归 operator 修）
  return "server_error";
}

/**
 * Stateless HTTP client for a GraphRAG-style document search backend.
 * Construct one per process; share across tasks safely.
 *
 * Differs from Mem0Adapter: scope is project-level (not per-role),
 * and V0.1 only exposes search (indexing is an offline operator action).
 */
export class GraphRAGAdapter {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  /**
   * Search the document corpus for relevant matches.
   *
   * @param query Non-empty natural language query (1-500 chars).
   * @param options Optional scope / filters / max_results.
   * @returns Array of matching documents, sorted by score desc. Empty array = no matches.
   * @throws Error if query is empty.
   * @throws GraphRAGApiError on HTTP 4xx/5xx or network failure.
   */
  async search(
    query: string,
    options?: GraphRAGSearchOptions,
  ): Promise<GraphRAGSearchResult[]> {
    // 1. 校验 query
    if (!query || query.trim() === "") {
      throw new Error("query required");
    }

    // 2. 构造请求体（V0.1：不做模型侧过滤，全交给后端）
    const body = {
      query,
      scope: options?.scope ?? "all",
      filters: options?.filters ?? {},
      max_results: options?.max_results ?? 5,
    };

    // 3. 构造 fetch 参数
    const url = `${this.baseUrl}/v1/search`;
    const init: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };

    // 4. 发起 fetch（catch 抛 GraphRAGApiError(0, "network")）
    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (err) {
      throw new GraphRAGApiError(0, "network", `search failed: ${err}`, err);
    }

    // 5. 处理响应
    if (response.ok) {
      const data = (await response.json()) as {
        results?: Array<Partial<GraphRAGSearchResult>>;
      };
      const results = data.results ?? [];
      return results.map((r) => ({
        id: r.id ?? "",
        content: r.content ?? "",
        score: typeof r.score === "number" ? r.score : 0,
        metadata: r.metadata ?? {},
        created_at: r.created_at ?? "",
      }));
    }

    // 6. 非 2xx：抛 GraphRAGApiError
    const code = mapStatusToCode(response.status);
    let errMessage = response.statusText;
    try {
      const errBody = (await response.json()) as { message?: string };
      if (errBody.message) errMessage = errBody.message;
    } catch {
      // ignore JSON parse failure, use statusText
    }
    throw new GraphRAGApiError(response.status, code, errMessage);
  }
}
