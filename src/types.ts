export type RunState = "Queued" | "Running" | "Cancelling" | "Completed" | "Failed" | "Cancelled";
export type IntakeState = "Disabled" | "Open" | "Closing" | "Closed";
export type TaskRequest = {
  task_id: string; instruction: string; workspace_ref: string;
  permissions: { read_paths: string[]; write_paths: string[]; tool_profile_ref: string };
  limits: { deadline_at: string; max_model_calls: number; max_tool_calls: number };
  output_paths: string[];
  discussion?: { room_id: string; trigger_event_id: string };
};
export type Progress = { model_calls: number; tool_calls: number; last_activity_at: string | null };
export type RunView = { run_id: string; task_id: string; state: RunState; accepted_at: string; started_at: string | null; finished_at: string | null; result_available: boolean; cancel_requested: boolean; progress: Progress };
export type TokenUsage = { source: "PiModelResponses"; quality: "Complete" | "Partial" | "Unknown"; input_tokens: number|null; output_tokens: number|null; total_tokens: number|null; cache_read_tokens: number|null; cache_write_tokens: number|null; reasoning_tokens: number|null; model_attempts: number; usage_observed_attempts: number; missing_fields: string[] };
export type FailureCode="DeadlineExceeded"|"BudgetExceeded"|"ModelUnavailable"|"ModelResponseInvalid"|"ToolFailure"|"UnsafeRetryBlocked"|"ExecutionStateUnknown"|"DiscussionAccessLost"|"CancelledByRequest"|"InternalError";
export type CauseClass="TaskDeadline"|"Budget"|"Dependency"|"ModelProtocol"|"Tool"|"ExecutionUnknown"|"Authorization"|"Cancellation"|"Internal";
export type Failure={code:FailureCode;cause_class:CauseClass;message:string};
export type KnownAction={kind:"ModelCall"|"ToolCall"|"FileWrite"|"MatrixSend"|"Other";status:"Completed"|"Failed"|"Unknown";description:string};
export type AgentResult = { run_id:string; task_id:string; generation:number; state:"Completed"|"Failed"|"Cancelled"; partial:boolean; summary:string; outputs:{path:string;sha256:string;size_bytes:number}[]; known_actions:KnownAction[]; usage:TokenUsage; failure:Failure|null; published_at:string };
export type RuntimeConfig = {
  instance_id:string; listen:{host:string;port:number}; api_auth:{mode:"bearer";principal_id:string;bearer_token_secret_ref:string};
  task_store:{sqlite_path:string;busy_timeout_ms:number}; pi:{version:"0.85.1";commit:string;session_root:string;adapter_patch_manifest_path:string;adapter_patch_sha256:string};
  agent:{model:string;profile_ref:string}; workspace:{roots:Record<string,string>;staging_root:string}; tools:{profile_registry_path:string};
  matrix:{enabled:boolean;homeserver?:string;user_id?:string;access_token_secret_ref?:string;sync_timeout_ms?:number;max_media_bytes?:number;allowed_mime_types?:string[]};
  llmtier:{base_url:string;api_key_secret_ref:string;models_timeout_ms:number}; queue:{capacity:number}; retention:{minimum_query_days:number}; observability:{log_level:string;metrics_enabled:boolean};
};
export class PikoError extends Error { constructor(readonly code:string, readonly status:number, message:string){super(message)} }
