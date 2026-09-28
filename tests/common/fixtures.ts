import type { RuntimeConfig, TaskRequest } from "../../src/types.js";

/** Test fixture: a minimal valid task definition under the v0.12 contract. */
export const task = (id = "task-1", over: Partial<TaskRequest> = {}): TaskRequest => ({
  task_id: id,
  instruction: "do it",
  workspace_ref: "repo",
  permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...over,
});

export const discussionTask = (id = "discussion-1"): TaskRequest =>
  task(id, { discussion: { room_id: "!room:test", trigger_event_id: "$trigger" } });

export const testConfig = (over: Partial<RuntimeConfig> = {}): RuntimeConfig => ({
  instance_id: "piko-test",
  listen: { host: "127.0.0.1", port: 0 },
  api_auth: { mode: "bearer", principal_id: "slinky", bearer_token_secret_ref: "env:PIKO_TOKEN" },
  task_store: { sqlite_path: ":memory:", busy_timeout_ms: 1000 },
  pi: { version: "0.85.1", commit: "9767ba275f3e9a5ee0f5c5342249b629ab1b2282", session_root: "/tmp/piko-pi" },
  agent: { model: "coding-standard", profile_ref: "agent:default" },
  workspace: { roots: { repo: process.cwd() }, staging_root: "/tmp/piko-staging" },
  tools: { profile_registry_path: "/etc/piko/tools.json" },
  matrix: { enabled: false },
  llmtier: { base_url: "https://llmtier.example/v1", api_key_secret_ref: "env:LLM_KEY", models_timeout_ms: 5000 },
  transfer: {
    method: "scp",
    credential_ref: "env:PIKO_SCP_KEY",
    target_allowlist: ["slinky-store:/srv/piko"],
    max_input_bytes: 104857600,
    retry: { max_attempts: 3, base_delay_ms: 500 },
  },
  queue: { capacity: 100 },
  retention: { minimum_query_days: 7 },
  observability: { log_level: "info", metrics_enabled: true },
  ...over,
});

export const emptyUsage = () => ({
  source: "PiModelResponses" as const,
  quality: "Complete" as const,
  input_tokens: 0,
  output_tokens: 0,
  total_tokens: 0,
  cache_read_tokens: 0,
  cache_write_tokens: 0,
  reasoning_tokens: 0,
  model_attempts: 0,
  usage_observed_attempts: 0,
  missing_fields: [] as string[],
});
