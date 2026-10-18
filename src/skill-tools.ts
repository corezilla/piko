// Skill Experience Tools for Piko V0.1
//
// Wraps Mem0Adapter as two Pi AgentHarnessTool instances:
// - mem0_lookup: search past skill experience
// - mem0_record: record a new lesson
//
// Per design: docs/20_system_design/mechanisms/piko-skill-memory.md
// Per ISD: docs/50_implementation_design/piko-skill-tools-impl.isd.md §11

import { Type, type Static } from "typebox";
import type { AgentHarnessTool } from "../upstream/pi/packages/agent/src/harness/types.ts";
import type { ExecutionToolContext } from "../upstream/pi/packages/agent/src/harness/tools/tool-context.ts";
import { Mem0Adapter, Mem0ApiError } from "./mem0-client.js";

// ============================================================
// Type definitions
// ============================================================

/** Per-task skill-tools execution context. Constructed by PiRuntime.execute(). */
export interface SkillToolContext {
  /** Role name (e.g., "tester", "developer"). */
  role: string;
  /** Project name (must match ^[A-Za-z0-9._-]+$). */
  projectName: string;
  /** Task ID (optional). */
  taskId?: string;
}

/** Dependency injection container for skill-tools. */
export interface SkillToolDeps {
  mem0: Mem0Adapter;
  context: SkillToolContext;
}

/** Details returned by mem0_lookup tool. */
export interface Mem0LookupDetails {
  /** Number of results returned (0 is valid). */
  count?: number;
  /** Error code (only present in fallback path). */
  error?: string;
  /** HTTP status (only present in fallback path, 0 = network error). */
  status?: number;
}

/** Details returned by mem0_record tool. */
export interface Mem0RecordDetails {
  /** IDs of newly created memories (only present in success path). */
  ids?: string[];
  /** Error code (only present in fallback path). */
  error?: string;
}

// ============================================================
// TypeBox schemas
// ============================================================

export const Mem0LookupSchema = Type.Object({
  query: Type.String({
    description:
      "Natural language search query for past skill experience. " +
      "Be specific: include module name, scenario, or failure pattern.",
    minLength: 1,
    maxLength: 500,
  }),
  max_results: Type.Optional(
    Type.Number({
      description:
        "Maximum number of experiences to return. Default 5, max 20.",
      default: 5,
      minimum: 1,
      maximum: 20,
    }),
  ),
});

export type Mem0LookupParams = Static<typeof Mem0LookupSchema>;

export const Mem0RecordSchema = Type.Object({
  content: Type.String({
    description:
      "Markdown text describing the lesson learned. " +
      "Recommended structure: ## Situation (when this applies), ## Failure (what went wrong), " +
      "## Lesson (what to do instead). Skip if not worth recording.",
    minLength: 10,
    maxLength: 5000,
  }),
  tags: Type.Optional(
    Type.Array(Type.String(), {
      description: "Optional tags for filtering (e.g., ['async', 'auth', 'race-condition'])",
      maxItems: 10,
    }),
  ),
});

export type Mem0RecordParams = Static<typeof Mem0RecordSchema>;

// ============================================================
// Validation helper
// ============================================================

function validateContext(context: SkillToolContext): void {
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
// Factory: mem0_lookup
// ============================================================

const MEM0_LOOKUP_DESCRIPTION =
  "Search past skill experience for the current role in this project. " +
  "Use this when you want to know what has been learned before — e.g., test pitfalls, " +
  "code conventions, project-specific quirks, repeated failures. " +
  "Returns up to N relevant experiences with their original situation / failure / lesson.";

export function createMem0LookupTool(
  deps: SkillToolDeps,
): AgentHarnessTool<
  ExecutionToolContext,
  typeof Mem0LookupSchema,
  Mem0LookupDetails | undefined
> {
  validateContext(deps.context);
  return {
    name: "mem0_lookup",
    label: "Mem0 lookup",
    description: MEM0_LOOKUP_DESCRIPTION,
    parameters: Mem0LookupSchema,
    async execute(_toolCallId, params, _onUpdate, _toolContext, _invocation, _context) {
      // userId 在 Piko 侧构造（agent 不可控）
      const userId = `${deps.context.role}:${deps.context.projectName}`;

      try {
        const results = await deps.mem0.search(params.query, userId, {
          max_results: params.max_results ?? 5,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(results) }],
          details: { count: results.length },
        };
      } catch (e) {
        if (e instanceof Mem0ApiError) {
          return {
            content: [{ type: "text", text: `memory unavailable: ${e.code}` }],
            details: { error: e.code, status: e.status },
          };
        }
        throw e;
      }
    },
  };
}

// ============================================================
// Factory: mem0_record
// ============================================================

const MEM0_RECORD_DESCRIPTION =
  "Record a new lesson learned this task. " +
  "Use when you encountered a pitfall, surprising behavior, or repeated mistake " +
  "worth remembering for next time. Skip routine successes. " +
  "Recommended structure: ## Situation / ## Failure / ## Lesson.";

export function createMem0RecordTool(
  deps: SkillToolDeps,
): AgentHarnessTool<
  ExecutionToolContext,
  typeof Mem0RecordSchema,
  Mem0RecordDetails | undefined
> {
  validateContext(deps.context);
  return {
    name: "mem0_record",
    label: "Mem0 record",
    description: MEM0_RECORD_DESCRIPTION,
    parameters: Mem0RecordSchema,
    async execute(_toolCallId, params, _onUpdate, _toolContext, _invocation, _context) {
      // userId 在 Piko 侧构造（agent 不可控）
      const userId = `${deps.context.role}:${deps.context.projectName}`;

      // 构造 metadata
      const metadata: Record<string, any> = {
        type: "skill_experience",
        role: deps.context.role,
        task_id: deps.context.taskId,
        recorded_at: new Date().toISOString(),
        tags: params.tags ?? [],
      };

      try {
        const result = await deps.mem0.add(
          [{ role: "user", content: params.content }],
          userId,
          metadata,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
          details: { ids: result.ids },
        };
      } catch (e) {
        if (e instanceof Mem0ApiError) {
          return {
            content: [{ type: "text", text: `memory unavailable: ${e.code}` }],
            details: { error: e.code },
          };
        }
        throw e;
      }
    },
  };
}