// Smoke test for V0.1 modifications to pi-runtime.ts
// Verifies our changes don't break existing exports.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  discussionMessage,
  initialPrompt,
  normalizeRawUsage,
  buildSystemPrompt,
} from "../src/pi-runtime.js";
import type { TaskRequest, MemoryConfig, RuntimeConfig } from "../src/types.js";
import { createMem0LookupTool, createMem0RecordTool } from "../src/skill-tools.js";
import { Mem0Adapter } from "../src/mem0-client.js";

const task: TaskRequest = {
  task_id: "t",
  instruction: "typed instruction",
  workspace_ref: "repo",
  permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
  output_paths: [],
};

const memoryConfig: MemoryConfig = {
  provider: "mem0",
  api_key_secret_ref: "env:MEM0",
};

// ============================================================
// Existing exports still work
// ============================================================

test("existing: discussionMessage still exports", () => {
  const message = discussionMessage(
    { event_id: "$e", turn_seq: 1, status: "Pending", visible_content: "body" },
    123,
  );
  assert.ok(message);
});

test("existing: initialPrompt still exports", () => {
  const prompt = initialPrompt(task);
  assert.ok(prompt);
});

test("existing: normalizeRawUsage still exports", () => {
  const result = normalizeRawUsage({
    input_tokens: 100,
    output_tokens: 50,
    total_tokens: 150,
    input_tokens_details: {},
    output_tokens_details: {},
  });
  assert.equal(result.input, 100);
});

// ============================================================
// New buildSystemPrompt behavior
// ============================================================

test("buildSystemPrompt: no identity returns base only", () => {
  const prompt = buildSystemPrompt(task, undefined);
  assert.ok(!prompt.includes("mem0_lookup"));
  assert.ok(!prompt.includes("You are acting as"));
});

test("buildSystemPrompt: identity without memory has role but no skill tools", () => {
  const prompt = buildSystemPrompt(task, {
    role: "tester",
    name: "alice:tester",
  });
  assert.ok(prompt.includes("**tester**"));
  assert.ok(!prompt.includes("mem0_lookup"));
});

test("buildSystemPrompt: identity with memory includes skill tools hint", () => {
  const prompt = buildSystemPrompt(task, {
    role: "tester",
    name: "alice:tester",
    memory: memoryConfig,
  });
  assert.ok(prompt.includes("**tester**"));
  assert.ok(prompt.includes("mem0_lookup"));
  assert.ok(prompt.includes("mem0_record"));
  assert.ok(prompt.includes("role-scoped"));
});

// ============================================================
// New tool factories work with real Mem0Adapter
// ============================================================

test("skill-tools: createMem0LookupTool with real Mem0Adapter", () => {
  const mem0 = new Mem0Adapter("https://api.mem0.ai", "test-key");
  const tool = createMem0LookupTool({
    mem0,
    context: { role: "tester", projectName: "piko" },
  });
  assert.equal(tool.name, "mem0_lookup");
});

test("skill-tools: createMem0RecordTool with real Mem0Adapter", () => {
  const mem0 = new Mem0Adapter("https://api.mem0.ai", "test-key");
  const tool = createMem0RecordTool({
    mem0,
    context: { role: "tester", projectName: "piko", taskId: "task-1" },
  });
  assert.equal(tool.name, "mem0_record");
});

test("skill-tools: factory validates projectName", () => {
  const mem0 = new Mem0Adapter("https://api.mem0.ai", "test-key");
  assert.throws(
    () => createMem0LookupTool({ mem0, context: { role: "tester", projectName: "bad:project" } }),
    /projectName must match/,
  );
});

// ============================================================
// Type compatibility: MemoryConfig in RuntimeConfig.identity.memory
// ============================================================

test("types: RuntimeConfig.identity.memory accepts MemoryConfig", () => {
  const config: RuntimeConfig = {
    instance_id: "test",
    listen: { host: "127.0.0.1", port: 8787 },
    api_auth: { mode: "bearer", principal_id: "test", bearer_token_secret_ref: "env:X" },
    task_store: { sqlite_path: "/tmp/test.db", busy_timeout_ms: 1000 },
    pi: { version: "0.85.1", commit: "abc", session_root: "/tmp" },
    agent: { model: "test", profile_ref: "workspace-standard" },
    workspace: { roots: { piko: "/tmp" }, staging_root: "/tmp/staging" },
    tools: { profile_registry_path: "/tmp/profiles.json" },
    matrix: { enabled: false },
    llmtier: { base_url: "https://x", api_key_secret_ref: "env:X", models_timeout_ms: 1000 },
    queue: { capacity: 10 },
    retention: { minimum_query_days: 7 },
    observability: { log_level: "info", metrics_enabled: false },
    transfer: {
      method: "scp",
      target_allowlist: [],
      max_input_bytes: 100,
      retry: { max_attempts: 1, base_delay_ms: 100 },
    },
    identity: {
      role: "tester",
      name: "alice:tester",
      memory: {
        provider: "mem0",
        api_key_secret_ref: "env:MEM0",
      },
    },
  };
  assert.ok(config.identity);
  assert.ok(config.identity!.memory);
  assert.equal(config.identity!.memory.provider, "mem0");
});