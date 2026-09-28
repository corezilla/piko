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
    sync_timeout_ms?: number;
    max_media_bytes?: number;
    allowed_mime_types?: string[];
  };
  llmtier: { base_url: string; api_key_secret_ref: string; models_timeout_ms: number };
  transfer: {
    method: "scp" | "mount" | "object_store";
    credential_ref?: string;
    target_allowlist: string[];
    known_hosts?: string;
    max_input_bytes: number;
    retry: { max_attempts: number; base_delay_ms: number };
  };
  queue: { capacity: number };
  retention: { minimum_query_days: number };
  observability: { log_level: string; metrics_enabled: boolean };
};

export class PikoError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
