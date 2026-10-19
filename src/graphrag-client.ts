// GraphRAG-style document search HTTP client wrapper for Piko Doc Search
//
// Per design: docs/20_system_design/mechanisms/piko-doc-search.md
// Per ISD: docs/50_implementation_design/piko-graphrag-impl.isd.md §11
//
// V0.1.2: Piko's client no longer defines its own contract. We adopt
// the OpenSearch / Elasticsearch `_search` JSON-over-HTTP API, which is
// the industry-mainstream vector+keyword search protocol (compatible
// with Elasticsearch, OpenSearch, Bonsai, Elastic Cloud, AWS
// OpenSearch Service, self-hosted). Any operator-deployed service
// that exposes `/{index}/_search` works as the backend; piko does
// not define or wrap a custom protocol.
//
// Wire contract (see piko-doc-search.md §5.3 for the canonical spec):
//   POST {base_url}/{index}/_search
//   Authorization: Bearer {api_key}     (also accepts ApiKey for OS 2.x)
//   Content-Type: application/json
//   Body:
//     {
//       "size":  N,                       // 1..20
//       "query": {
//         "multi_match": {
//           "query": "<text>",
//           "fields": ["content^2", "title"],
//           "type":  "best_fields"
//         },
//         "bool": {                       // present iff piko caller passed `filters`
//           "filter": [ { "term": { <key>: <value> } }, ... ]
//         }
//       }
//     }
//   Response 200:
//     {
//       "hits": {
//         "hits": [
//           {
//             "_id":     "<chunk id>",
//             "_score":  <number>,
//             "_source": {
//               "content":    "<text>",
//               "metadata":   { ... },
//               "created_at": "<iso>"
//             }
//           },
//           ...
//         ]
//       }
//     }
//   Response 404: index not found → GraphRAGApiError code=not_found
//   Response 5xx/4xx → GraphRAGApiError with semantic code mapping

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
  /** OpenSearch index name. Backend-defined (e.g. "piko-design-docs",
   *  "std-templates", "_all"). Defaults to `defaultScope` on the
   *  adapter, then "all". */
  scope?: string;
  /** OpenSearch filter terms. Each key/value becomes a
   *  `bool.filter: [{ term: { k: v } }]` clause. */
  filters?: Record<string, any>;
  /** Maximum results. Caller is responsible for the [1, 20] bound
   *  (schema-enforced). Mapped to OpenSearch `size`. */
  max_results?: number;
}

/** Map HTTP status code to semantic error code. */
function mapStatusToCode(status: number): string {
  if (status === 401) return "auth_invalid";
  if (status === 403) return "auth_forbidden";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  if (status >= 500 && status < 600) return "server_error";
  return "server_error";
}

/**
 * Stateless HTTP client for an OpenSearch / Elasticsearch _search
 * backend. Construct one per process; share across tasks safely.
 *
 * V0.1 only exposes search (indexing is an offline operator action).
 */
export class GraphRAGAdapter {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    /**
     * Default OpenSearch index to query when the caller doesn't pass
     * `options.scope`. Typically set by Piko to the per-role
     * `IdentityConfig.doc_search.default_scope`. Falls back to "all"
     * which most OpenSearch deployments alias to `_all`.
     */
    private readonly defaultScope: string = "all",
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
    if (!query || query.trim() === "") {
      throw new Error("query required");
    }

    // Resolve index: per-call scope > adapter defaultScope > "all"
    const index = encodeURIComponent(
      options?.scope ?? this.defaultScope ?? "all",
    );
    const url = `${this.baseUrl.replace(/\/+$/, "")}/${index}/_search`;

    // Build OpenSearch request body. `multi_match` on content+title
    // is the standard piko search pattern; content is weighted higher
    // (^2) because title is often short and noisy.
    const topK = options?.max_results ?? 5;
    const queryClause: Record<string, any> = {
      multi_match: {
        query,
        fields: ["content^2", "title"],
        type: "best_fields",
      },
    };
    // piko filter dict → OpenSearch `bool.filter` term clauses
    const filterEntries = Object.entries(options?.filters ?? {});
    if (filterEntries.length > 0) {
      queryClause.bool = {
        filter: filterEntries.map(([k, v]) => ({ term: { [k]: v } })),
      };
    }
    const body = { size: topK, query: queryClause };

    const init: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (err) {
      throw new GraphRAGApiError(0, "network", `search failed: ${err}`, err);
    }

    if (response.ok) {
      const data = (await response.json()) as {
        hits?: {
          hits?: Array<{
            _id?: string;
            _score?: number;
            _source?: {
              content?: string;
              metadata?: Record<string, any>;
              created_at?: string;
            };
          }>;
        };
      };
      const hits = data.hits?.hits ?? [];
      return hits.map((h) => {
        const src = h._source ?? {};
        return {
          id: h._id ?? "",
          content: src.content ?? "",
          score: typeof h._score === "number" ? h._score : 0,
          metadata: src.metadata ?? {},
          created_at: src.created_at ?? "",
        };
      });
    }

    const code = mapStatusToCode(response.status);
    let errMessage = response.statusText;
    try {
      const errBody = (await response.json()) as {
        error?: { reason?: string; type?: string };
        message?: string;
      };
      if (errBody.error?.reason) errMessage = errBody.error.reason;
      else if (errBody.message) errMessage = errBody.message;
    } catch {
      // ignore JSON parse failure, use statusText
    }
    throw new GraphRAGApiError(response.status, code, errMessage);
  }
}
