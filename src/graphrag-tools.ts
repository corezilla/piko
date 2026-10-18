// Doc Search Tools for Piko V0.1
//
// Wraps GraphRAGAdapter as a single Pi AgentHarnessTool:
// - graphrag_search: search the project design/STD document corpus
//
// Per design: docs/20_system_design/mechanisms/piko-doc-search.md
// Per ISD: docs/50_implementation_design/piko-graphrag-impl.isd.md §11

import { Type, type Static } from "typebox";
import type { AgentHarnessTool } from "../upstream/pi/packages/agent/src/harness/types.ts";
import type { ExecutionToolContext } from "../upstream/pi/packages/agent/src/harness/tools/tool-context.ts";
import { GraphRAGAdapter, GraphRAGApiError } from "./graphrag-client.js";

// ============================================================
// Type definitions
// ============================================================

/** Per-task doc-search-tools execution context. Constructed by PiRuntime.execute(). */
export interface DocSearchToolContext {
  /** Role name (e.g. "tester", "developer"). Required for parity with Mem0 skill context
   *  validation, even though GraphRAG ignores role (scope is project-wide). */
  role: string;
  /** Project name (must match ^[A-Za-z0-9._-]+$). */
  projectName: string;
  /** Task ID (optional). */
  taskId?: string;
}

/** Dependency injection container for doc-search-tools. */
export interface DocSearchToolDeps {
  graphrag: GraphRAGAdapter;
  context: DocSearchToolContext;
}

/** Details returned by graphrag_search tool. */
export interface GraphragSearchDetails {
  /** Number of results returned (0 is valid). */
  count?: number;
  /** Error code (only present in fallback path). */
  error?: string;
  /** HTTP status (only present in fallback path, 0 = network error). */
  status?: number;
  /** Resolved scope used for the query. */
  scope?: string;
}

// ============================================================
// TypeBox schemas
// ============================================================

export const GraphragSearchSchema = Type.Object({
  query: Type.String({
    description:
      "Natural language search query for project docs / STD corpus. " +
      "Be specific: include module name, feature, or document identifier.",
    minLength: 1,
    maxLength: 500,
  }),
  scope: Type.Optional(
    Type.String({
      description:
        "Optional corpus scope identifier (e.g. 'piko-design-docs', " +
        "'std-templates', 'all'). Defaults to 'all' when omitted.",
      maxLength: 128,
    }),
  ),
  max_results: Type.Optional(
    Type.Number({
      description: "Maximum number of document chunks to return. Default 5, max 20.",
      default: 5,
      minimum: 1,
      maximum: 20,
    }),
  ),
});

export type GraphragSearchParams = Static<typeof GraphragSearchSchema>;

// ============================================================
// Validation helper
// ============================================================

/** Mirrors skill-tools.ts validateContext: same role/projectName rules so Piko
 *  fails fast on bad binding regardless of which tool family the agent hits. */
export function validateDocSearchContext(context: DocSearchToolContext): void {
  if (!context.role || context.role.trim() === "") {
    throw new Error("role required");
  }
  if (!context.projectName || context.projectName.trim() === "") {
    throw new Error("projectName required");
  }
  if (!/^[A-Za-z0-9._-]+$/.test(context.projectName)) {
    throw new Error("projectName must match ^[A-Za-z0-9._-]+$");
  }
}

// ============================================================
// Factory: graphrag_search
// ============================================================

const GRAPHRAG_SEARCH_DESCRIPTION =
  "Search the project's design/STD document corpus for relevant content. " +
  "Use this when you need to recall what the project's specs, mechanism docs, " +
  "or interface contracts say about a topic — e.g., 'how does the doc-search " +
  "tool scope work', 'what is the rule for X'. Returns up to N relevant " +
  "document chunks with their source. Indexing is an offline operator action; " +
  "you can only search what is already indexed into the corpus.";

export function createGraphragSearchTool(
  deps: DocSearchToolDeps,
): AgentHarnessTool<
  ExecutionToolContext,
  typeof GraphragSearchSchema,
  GraphragSearchDetails | undefined
> {
  validateDocSearchContext(deps.context);
  return {
    name: "graphrag_search",
    label: "GraphRAG search",
    description: GRAPHRAG_SEARCH_DESCRIPTION,
    parameters: GraphragSearchSchema,
    async execute(_toolCallId, params, _onUpdate, _toolContext, _invocation, _context) {
      const scope = params.scope ?? "all";
      try {
        const results = await deps.graphrag.search(params.query, {
          scope: params.scope,
          max_results: params.max_results,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(results) }],
          details: { count: results.length, scope },
        };
      } catch (e) {
        if (e instanceof GraphRAGApiError) {
          return {
            content: [{ type: "text", text: `doc search unavailable: ${e.code}` }],
            details: { error: e.code, status: e.status, scope },
          };
        }
        throw e;
      }
    },
  };
}
