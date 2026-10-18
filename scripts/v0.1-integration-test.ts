// Integration test: load tool-profiles.json with new mem0 tools + validate against schema

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// ============================================================
// Tool profile loading (using the existing validateToolRegistry logic)
// ============================================================

test("tool-profiles: workspace-standard contains mem0_lookup and mem0_record", () => {
  const profiles = JSON.parse(readFileSync("config/tool-profiles.json", "utf8"));
  const std = profiles.profiles["workspace-standard"];
  assert.ok(std.tools.mem0_lookup, "mem0_lookup missing");
  assert.ok(std.tools.mem0_record, "mem0_record missing");
  assert.equal(std.tools.mem0_lookup.effect, "external");
  assert.equal(std.tools.mem0_record.effect, "external");
  assert.equal(std.tools.mem0_lookup.replay, "never");
  assert.deepEqual(std.tools.mem0_lookup.permissions.network_hosts, ["api.mem0.ai"]);
});

test("tool-profiles: workspace-exec contains mem0_lookup and mem0_record", () => {
  const profiles = JSON.parse(readFileSync("config/tool-profiles.json", "utf8"));
  const exec = profiles.profiles["workspace-exec"];
  assert.ok(exec.tools.mem0_lookup);
  assert.ok(exec.tools.mem0_record);
});

test("tool-profiles: existing tools (read/write/edit/bash) unchanged", () => {
  const profiles = JSON.parse(readFileSync("config/tool-profiles.json", "utf8"));
  for (const profileName of ["workspace-standard", "workspace-exec"]) {
    const p = profiles.profiles[profileName];
    assert.ok(p.tools.read);
    assert.ok(p.tools.write);
    assert.ok(p.tools.edit);
    assert.equal(p.tools.read.effect, "read_only");
    assert.equal(p.tools.write.effect, "workspace_write");
  }
  const exec = profiles.profiles["workspace-exec"];
  assert.ok(exec.tools.bash);
  assert.equal(exec.tools.bash.effect, "process");
});

// ============================================================
// runtime.example.json contains identity
// ============================================================

test("runtime.example.json: identity block is well-formed", () => {
  const example = JSON.parse(readFileSync("config/runtime.example.json", "utf8"));
  assert.ok(example.identity);
  assert.equal(example.identity.role, "developer");
  assert.equal(example.identity.memory.provider, "mem0");
  assert.match(example.identity.memory.api_key_secret_ref, /^env:/);
});

test("runtime.example.json: all required top-level fields present", () => {
  const example = JSON.parse(readFileSync("config/runtime.example.json", "utf8"));
  const required = [
    "instance_id", "listen", "api_auth", "task_store", "pi",
    "agent", "workspace", "tools", "matrix", "llmtier",
    "queue", "retention", "observability", "transfer"
  ];
  for (const f of required) {
    assert.ok(example[f], `missing required field: ${f}`);
  }
});

// ============================================================
// Schema validates runtime.example.json
// ============================================================

test("schema: validates runtime.example.json with Ajv", async () => {
  const Ajv = (await import("ajv/dist/2020.js")).default;
  const addFormats = (await import("ajv-formats/dist/index.js")).default;

  // Strip JSON comments from schema
  let schemaText = readFileSync("interfaces/schemas/piko-runtime-config-v0.3.schema.json", "utf8");
  schemaText = schemaText.replace(/^\s*"[/][/].*$/gm, "");
  const schema = JSON.parse(schemaText);

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const validate = ajv.compile(schema);
  const example = JSON.parse(readFileSync("config/runtime.example.json", "utf8"));
  const valid = validate(example);
  if (!valid) {
    console.error("Ajv errors:", validate.errors);
  }
  assert.equal(valid, true, "runtime.example.json should validate against schema");
});

// ============================================================
// Schema validates minimal sample with identity
// ============================================================

test("schema: validates minimal sample with identity block", async () => {
  const Ajv = (await import("ajv/dist/2020.js")).default;

  let schemaText = readFileSync("interfaces/schemas/piko-runtime-config-v0.3.schema.json", "utf8");
  schemaText = schemaText.replace(/^\s*"[/][/].*$/gm, "");
  const schema = JSON.parse(schemaText);

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  const sample = {
    instance_id: "test",
    listen: { host: "127.0.0.1", port: 8787 },
    api_auth: { mode: "bearer", principal_id: "p", bearer_token_secret_ref: "env:X" },
    task_store: { sqlite_path: "/x", busy_timeout_ms: 100 },
    pi: { version: "0.85.1", commit: "9767ba275f3e9a5ee0f5c5342249b629ab1b2282", session_root: "/x" },
    agent: { model: "x", profile_ref: "workspace-standard" },
    workspace: { roots: { piko: "/x" }, staging_root: "/x" },
    tools: { profile_registry_path: "/x" },
    matrix: { enabled: false },
    llmtier: { base_url: "https://x", api_key_secret_ref: "env:X", models_timeout_ms: 1000 },
    queue: { capacity: 1 },
    retention: { minimum_query_days: 7 },
    observability: { log_level: "info", metrics_enabled: false },
    transfer: { method: "scp", target_allowlist: ["x:/x"], max_input_bytes: 1, retry: { max_attempts: 1, base_delay_ms: 1 } },
    identity: {
      role: "tester",
      name: "alice:tester",
      memory: {
        provider: "mem0",
        api_key_secret_ref: "env:MEM0",
      },
    },
  };
  const ok2 = validate(sample);
  if (!ok2) console.error("Ajv errors:", JSON.stringify(validate.errors, null, 2));
  assert.equal(ok2, true, "minimal sample with identity should validate");
});

// ============================================================
// Schema rejects bad identity (wrong role pattern)
// ============================================================

test("schema: rejects identity with uppercase role (pattern mismatch)", async () => {
  const Ajv = (await import("ajv/dist/2020.js")).default;

  let schemaText = readFileSync("interfaces/schemas/piko-runtime-config-v0.3.schema.json", "utf8");
  schemaText = schemaText.replace(/^\s*"[/][/].*$/gm, "");
  const schema = JSON.parse(schemaText);

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  const sample = {
    instance_id: "test",
    listen: { host: "127.0.0.1", port: 8787 },
    api_auth: { mode: "bearer", principal_id: "p", bearer_token_secret_ref: "env:X" },
    task_store: { sqlite_path: "/x", busy_timeout_ms: 100 },
    pi: { version: "0.85.1", commit: "abc", session_root: "/x" },
    agent: { model: "x", profile_ref: "workspace-standard" },
    workspace: { roots: { piko: "/x" }, staging_root: "/x" },
    tools: { profile_registry_path: "/x" },
    matrix: { enabled: false },
    llmtier: { base_url: "https://x", api_key_secret_ref: "env:X", models_timeout_ms: 1000 },
    queue: { capacity: 1 },
    retention: { minimum_query_days: 7 },
    observability: { log_level: "info", metrics_enabled: false },
    transfer: { method: "scp", target_allowlist: [], max_input_bytes: 1, retry: { max_attempts: 1, base_delay_ms: 1 } },
    identity: {
      role: "Tester",  // uppercase, should fail (pattern: ^[a-z_]...)
      name: "alice",
      memory: { provider: "mem0", api_key_secret_ref: "env:MEM0" },
    },
  };
  const result = validate(sample);
  assert.equal(result, false, "should reject uppercase role");
  assert.ok(
    validate.errors?.some((e: any) => e.instancePath?.includes("identity") || e.schemaPath?.includes("identity")),
    "errors should reference identity",
  );
});