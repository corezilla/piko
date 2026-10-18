// Piko Agent Runtime — contract types, aligned to interfaces/schemas/agent-runtime-v0.3.schema.json
// (v0.3.0-simplified.6, data-plane revision; no run_id, no task-level limits)

export type TaskState = "Queued" | "Running" | "Cancelling" | "Completed" | "Failed" | "Cancelled";
export type TerminalState = "Completed" | "Failed" | "Cancelled";
export type IntakeState = "Disabled" | "Open" | "Closing" | "Closed";

export type InputRef = { source: string; dest?: string; sha256?: string };
export type ArtifactTarget = { method: "scp" | "mount" | "object_store"; target: string; secret_ref?: string };

export type TaskRequest = {
  task_id: string;
  instruction: string;
  workspace_ref: string;
  permissions: { read_paths: string[]; write_paths: string[]; tool_profile_ref: string };
  output_paths: string[];
  input_refs?: InputRef[];
  artifact_target?: ArtifactTarget;
  discussion?: { room_id: string; trigger_event_id: string };
  /** Optional STD templates referenced by this task.  When present, Piko
   *  must produce output conforming to these templates.  Template IDs
   *  reference STD's template catalog; Piko itself does not define
   *  templates — it only renders them. */
  std_templates?: {
    /** STD template ID for the output document (e.g. "tests.unit-test-scheme"). */
    scheme?: string;
    /** STD template ID for case-level detail (e.g. "tests.unit-case"). */
    case?: string;
  };
};

export type InputStaging = {
  state: "none" | "pending" | "in_progress" | "ready" | "failed";
  fetched: InputRef[];
  failed: { source: string; error: string }[];
};

export type OutputArtifact = { path: string; sha256: string; size_bytes: number };
export type ArtifactDelivery = {
  state: "none" | "pending" | "in_progress" | "delivered" | "partial" | "failed";
  delivered: OutputArtifact[];
  failed: { path: string; error: string }[];
};

export type KnownAction = {
  kind: "ModelCall" | "ToolCall" | "FileWrite" | "MatrixSend" | "Other";
  status: "Completed" | "InProgress" | "Failed" | "Unknown";
  description: string;
};

export type Progress = {
  model_calls: number;
  tool_calls: number;
  last_activity_at: string | null;
  elapsed_ms: number;
  usage_so_far: { input_tokens: number | null; output_tokens: number | null; total_tokens: number | null };
  recent_actions: KnownAction[];
  current_action: string | null;
};

export type TaskView = {
  task_id: string;
  state: TaskState;
  generation: number;
  accepted_at: string;
  started_at: string | null;
  finished_at: string | null;
  result_available: boolean;
  cancel_requested: boolean;
  discussion_intake_state: IntakeState;
  input_staging: InputStaging;
  progress: Progress;
  artifact_delivery: ArtifactDelivery;
};

export type TaskStats = {
  model_calls: number;
  tool_calls: number;
  duration_ms: number;
  outputs_count: number;
  outputs_bytes: number;
};

export type TokenUsage = {
  source: "PiModelResponses";
  quality: "Complete" | "Partial" | "Unknown";
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  cache_read_tokens: number | null;
  cache_write_tokens: number | null;
  reasoning_tokens: number | null;
  model_attempts: number;
  usage_observed_attempts: number;
  missing_fields: string[];
};

export type FailureCode =
  | "ModelUnavailable"
  | "ModelResponseInvalid"
  | "ToolFailure"
  | "UnsafeRetryBlocked"
  | "ExecutionStateUnknown"
  | "DiscussionAccessLost"
  | "InputFetchFailed"
  | "CancelledByRequest"
  | "InternalError";
export type CauseClass =
  | "Dependency"
  | "ModelProtocol"
  | "Tool"
  | "ExecutionUnknown"
  | "Authorization"
  | "Cancellation"
  | "Internal";
export type Failure = { code: FailureCode; cause_class: CauseClass; message: string };

export type AgentResult = {
  task_id: string;
  generation: number;
  state: TerminalState;
  partial: boolean;
  summary: string;
  outputs: OutputArtifact[];
  stats: TaskStats;
  known_actions: KnownAction[];
  usage: TokenUsage;
  failure: Failure | null;
  published_at: string;
};

export type CancelOutcome = "CancelledBeforeStart" | "StopRequested" | "AlreadyTerminal";

export type RuntimeConfig = {
  instance_id: string;
  listen: { host: string; port: number };
  api_auth: { mode: "bearer"; principal_id: string; bearer_token_secret_ref: string };
  task_store: { sqlite_path: string; busy_timeout_ms: number };
  pi: { version: string; commit: string; session_root: string };
  agent: { model: string; profile_ref: string };
  workspace: { roots: Record<string, string>; staging_root: string };
  tools: { profile_registry_path: string };
  matrix: {
    enabled: boolean;
    homeserver?: string;
    user_id?: string;
    access_token_secret_ref?: string;
    direct_access_token?: string;
    sync_timeout_ms?: number;
    max_media_bytes?: number;
    allowed_mime_types?: string[];
  };
  llmtier: { base_url: string; api_key_secret_ref: string; models_timeout_ms: number };
  transfer: {
    method: "scp" | "mount" | "object_store";
    credential_ref?: string;
    /** Non-default SSH port for scp. Omit for 22. */
    port?: number;
    target_allowlist: string[];
    known_hosts?: string;
    max_input_bytes: number;
    retry: { max_attempts: number; base_delay_ms: number };
  };
  queue: { capacity: number };
  retention: { minimum_query_days: number };
  observability: { log_level: string; metrics_enabled: boolean };
  /** Optional role identity and memory integration configuration.
   *  When present, this Piko instance acts as a specific role
   *  (e.g. "test_engineer") with an identity (e.g. "alice:test_engineer")
   *  and connects to configured memory/skill backends during execution. */
  identity?: {
    /** Role the Piko instance plays (architect, software_engineer, test_engineer, etc.). */
    role: string;
    /** Human-readable identity of this Piko instance (e.g. "alice:test_engineer"). */
    name: string;
    /** Per-role skill experience backend (Mem0 in V0.1). */
    memory: MemoryConfig;
    /** V0.1: project-wide document corpus search backend (GraphRAG-style).
     *  Sibling to `memory`: scopes are different (per-role short lessons vs
     *  project-wide design/STD corpus). Either can be configured independently. */
    doc_search?: DocSearchConfig;
  };
};

/**
 * V0.1: external memory backend configuration.
 *
 * Currently hard-coded to Mem0 (other backends deferred to V1.x).
 * `api_key_secret_ref` is resolved at startup via config.resolveSecret.
 */
export interface MemoryConfig {
  /** V0.1: hard-code "mem0". */
  provider: "mem0";
  /** Secret ref: env:XXX or file:XXX; resolved via config.resolveSecret at startup. */
  api_key_secret_ref: string;
  /** Self-hosted base URL. Omit for Mem0 Cloud (default https://api.mem0.ai). */
  base_url?: string;
  /** User ID template. V0.1 reserved for future use; default "${role}:${project}". */
  user_id_template?: string;
}

/**
 * V0.1: project-wide document corpus search backend configuration.
 *
 * Sibling to MemoryConfig — see RuntimeConfigIdentity.doc_search.
 *
 * Differs from MemoryConfig in three ways:
 *   1. No Cloud default for `base_url` (no off-the-shelf GraphRAG Cloud vendor).
 *   2. Scope is project-wide (not per-role); no `user_id_template`.
 *   3. Indexing is an offline operator action; only search is exposed at runtime.
 *
 * `api_key_secret_ref` is resolved at startup via config.resolveSecret.
 */
export interface DocSearchConfig {
  /** V0.1: hard-code "graphrag". */
  provider: "graphrag";
  /** Secret ref: env:XXX or file:XXX; resolved via config.resolveSecret at startup. */
  api_key_secret_ref: string;
  /** Base URL of the GraphRAG-style backend. REQUIRED — no Cloud default in V0.1. */
  base_url: string;
  /** Default scope the agent's graphrag_search tool resolves to when omitting `scope`.
   *  Defaults to "all" on the wire when omitted. */
  default_scope?: string;
}

export class PikoError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
