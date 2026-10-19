// scripts/piko-debug-run.ts (V0.1.1 debug harness)
//
// Boots `scripts/mock-mem0.ts` + `scripts/mock-graphrag.ts` as child
// processes, then constructs a real `PiRuntime` pointed at the user's
// local mlx-serve (Qwen3.8-Flash) and runs a software-engineer task
// end-to-end through piko's agentic loop.
//
// Output: writes `/tmp/cc-debug-workspace-*/greeting.ts` (or whichever
// file the task instruction requests) and prints the result.
//
// Run:
//   tsx scripts/piko-debug-run.ts
//
// Env overrides (defaults match the user's machine):
//   MLX_PORT          (default 11234 — mlx-serve)
//   MLX_MODEL         (default "Qwen3.8-Flash-Next-Uncensored-REAP288-MTP-MLX-4bit")
//   MOCK_MEM0_PORT    (default 9999)
//   MOCK_GRAPH_PORT   (default 8765)
//
// H2-fix note: the harness writes a *debug-time* tool profile that
// adds 127.0.0.1 to each external tool's network_hosts allowlist, so
// the mock backends (running on 127.0.0.1) are reachable. Without
// this, the H2 network policy would correctly reject the call.
// The real `config/tool-profiles.json` is untouched.

import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { validateToolRegistry, type ToolRegistry } from "../src/config.js";
import { TaskStore } from "../src/store.js";
import { PiRuntime } from "../src/pi-runtime.js";
import { LocalChannel, FactHandler } from "../src/ipc.js";
import { installNetworkPolicy, restoreNetworkPolicy } from "../src/tool-host-policy.js";
import type { RuntimeConfig, TaskRequest } from "../src/types.js";

const MLX_PORT = Number(process.env.MOCK_MLX_PORT ?? 11234);
const MOCK_MEM0_PORT = Number(process.env.MOCK_MEM0_PORT ?? 9999);
const MOCK_GRAPH_PORT = Number(process.env.MOCK_GRAPH_PORT ?? 8765);

const MLX_BASE = `http://127.0.0.1:${MLX_PORT}/v1`;
const MLX_MODEL = process.env.MLX_MODEL ?? "Qwen3.8-Flash-Next-Uncensored-REAP288-MTP-MLX-4bit";
const MLX_KEY = process.env.MOCK_MLX_KEY ?? "sk-no-auth-needed-for-local-mlx";

const MEMORY_BASE = `http://127.0.0.1:${MOCK_MEM0_PORT}/v1`;
const GRAPH_BASE = `http://127.0.0.1:${MOCK_GRAPH_PORT}/v1`;

function spawnBg(label: string, cmd: string, args: string[]): { pid: number; alive: () => boolean } {
  const proc = spawn(cmd, args, { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] });
  proc.stdout.on("data", (b) => process.stdout.write(`[${label}] ${b}`));
  proc.stderr.on("data", (b) => process.stderr.write(`[${label}] ${b}`));
  return { pid: proc.pid ?? -1, alive: () => proc.exitCode === null };
}

async function waitForUrl(url: string, label: string, timeoutMs = 5000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url, { method: "POST" });
      if (r.status >= 200 && r.status < 500) return;  // any 2xx/4xx = "alive"
    } catch {
      /* not yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`timeout waiting for ${label} at ${url}`);
}

async function main() {
  console.log("[harness] booting mocks...");
  spawnBg("mock-mem0", "npx", ["tsx", "scripts/mock-mem0.ts"]);
  spawnBg("mock-graphrag", "npx", ["tsx", "scripts/mock-graphrag.ts"]);
  // mlx-serve is already running externally; just probe
  await waitForUrl(`${MLX_BASE}/v1/models`, "mlx-server", 5000);
  await waitForUrl(`${MEMORY_BASE}/v1/memories/search_/`, "mock-mem0", 5000);  // 404 is fine
  await waitForUrl(`${GRAPH_BASE}/v1/search`, "mock-graphrag", 5000);  // 405 fine
  console.log("[harness] upstreams ready");

  installNetworkPolicy();
  console.log("[harness] network policy installed");

  const workspace = join(tmpdir(), `cc-debug-workspace-${Date.now()}`);
  mkdirSync(workspace, { recursive: true });
  const sqlitePath = join(tmpdir(), `cc-debug-store-${Date.now()}.sqlite`);

  // Build a debug-time tool profile that adds 127.0.0.1 (mock backend
  // origin) to each external tool's network_hosts allowlist. The real
  // profile in config/tool-profiles.json enforces a Cloud-only
  // allowlist which the H2 fix correctly rejects; for harness work
  // we simulate local-stack operation.
  const realProfileRaw = JSON.parse(readFileSync("config/tool-profiles.json", "utf8"));
  const debugProfileRaw = JSON.parse(JSON.stringify(realProfileRaw));
  for (const profile of Object.values(debugProfileRaw.profiles) as any[]) {
    for (const [, t] of Object.entries(profile.tools)) {
      const hosts = (t as any).permissions?.network_hosts;
      if (Array.isArray(hosts)) hosts.push("127.0.0.1");
    }
  }
  const debugProfilePath = `/tmp/cc-debug-tool-profiles-${Date.now()}.json`;
  writeFileSync(debugProfilePath, JSON.stringify(debugProfileRaw, null, 2));
  process.env.__CC_DEBUG_PROFILE_PATH__ = debugProfilePath;
  console.log(`[harness] wrote debug tool profile (adds 127.0.0.1): ${debugProfilePath}`);

  const cfg: RuntimeConfig = {
    instance_id: "piko-debug",
    listen: { host: "127.0.0.1", port: 8787 },
    api_auth: { mode: "bearer", principal_id: "piko-debug", bearer_token_secret_ref: "env:PIKO_API_BEARER" },
    task_store: { sqlite_path: sqlitePath, busy_timeout_ms: 5000 },
    pi: { version: "0.85.1", commit: "9767ba275f3e9a5ee0f5c5342249b629ab1b2282", session_root: workspace },
    agent: { model: MLX_MODEL, profile_ref: "workspace-exec" },
    workspace: { roots: { piko: workspace }, staging_root: workspace },
    tools: { profile_registry_path: debugProfilePath },
    matrix: { enabled: false },
    llmtier: {
      base_url: MLX_BASE,
      api_key_secret_ref: "env:PIKO_LLM_API_KEY",
      models_timeout_ms: 60_000,  // schema caps at 60_000; mlx cold start may exceed this
    },
    queue: { capacity: 100 },
    retention: { minimum_query_days: 7 },
    observability: { log_level: "info", metrics_enabled: false },
    transfer: { method: "scp", target_allowlist: ["piko-debug:/x"], max_input_bytes: 1_048_576, retry: { max_attempts: 0, base_delay_ms: 0 } },
    identity: {
      role: "software_engineer",
      name: "alice:software_engineer",
      memory: {
        provider: "mem0",
        api_key_secret_ref: "env:MEM0_API_KEY",
        base_url: MEMORY_BASE,
        user_id_template: "${role}:${project}",
      },
      doc_search: {
        provider: "graphrag",
        api_key_secret_ref: "env:GRAPHRAG_API_KEY",
        base_url: GRAPH_BASE,
        default_scope: "piko-design-docs",
      },
    },
  };

  // Ajv validate to catch schema errors early.
  {
    const AjvCtor: any = (Ajv as any).default ?? Ajv;
    const formats: any = (addFormats as any).default ?? addFormats;
    const ajv = new AjvCtor({ allErrors: true, strict: false });
    formats(ajv);
    const schemaText = readFileSync("interfaces/schemas/piko-runtime-config-v0.3.schema.json", "utf8");
    const schema = JSON.parse(schemaText);
    if (!ajv.validate(schema, cfg)) {
      console.error("[harness] Ajv invalid:", ajv.errorsText());
      throw new Error("RuntimeConfig failed Ajv validation");
    }
  }

  // Pin the env vars PiRuntime expects.
  process.env.PIKO_LLM_API_KEY = MLX_KEY;
  process.env.MEM0_API_KEY = "mock-key";
  process.env.GRAPHRAG_API_KEY = "mock-key";

  const store = new TaskStore(cfg.task_store.sqlite_path, cfg.task_store.busy_timeout_ms);
  // task_store.sqlite_path == ":memory:" requires better-sqlite3 to support it.
  // Piko's TaskStore passes the path through. better-sqlite3's ":memory:" works
  // but Piko may need a real file for `agent.session_root` — handled above.

  const handler = new FactHandler(store);
  const channel = new LocalChannel((fact) => handler.apply(fact));

  const { tools: toolsRegistry } = loadToolsRegistry();

  const piRuntime = new PiRuntime(
    cfg,
    toolsRegistry,
    store,
    channel,
    MLX_KEY,           // apiKey
    "mock-key",        // mem0ApiKey
    "mock-key",        // graphragApiKey
  );

  // Build a TaskRequest — software engineer task: write a small module.
  const task: TaskRequest = {
    task_id: `debug-${Date.now()}`,
    instruction:
      "In the workspace directory, create the file `greeting.ts` that exports a function `greeting(name: string): string` which returns `Hello, ${name}!`. Apply Piko TypeScript conventions (strict typing, named export, doc comment). When done, print the file's content and exit.",
    workspace_ref: "piko",
    permissions: {
      // . = workspace root; allow read+write everywhere inside workspace
      // (staging_root check relies on paths being relative-to-staging_root).
      read_paths: ["."],
      write_paths: ["."],
      tool_profile_ref: "workspace-exec",
    },
    output_paths: [],
  };

  console.log("[harness] starting PiRuntime.execute() — mlx cold start may take 30-90s on first turn");

  let result;
  try {
    result = await piRuntime.execute(
      task.task_id,
      0,
      task,
      workspace,
      () => false,
    );
  } catch (e: any) {
    console.error("[harness] execute() threw:", e?.message ?? e);
    result = { status: "failed", summary: e?.message ?? String(e), failure: e?.failure };
  } finally {
    try { await piRuntime.close(); } catch { /* ignore */ }
    restoreNetworkPolicy();
  }

  console.log("[harness] result:", JSON.stringify(result, null, 2));
  console.log(`[harness] workspace: ${workspace}`);
  const targetFile = join(workspace, "greeting.ts");
  if (existsSync(targetFile)) {
    console.log("[harness] === greeting.ts content ===");
    process.stdout.write(readFileSync(targetFile, "utf8"));
    console.log("[harness] === end greeting.ts ===");
  } else {
    console.log("[harness] (greeting.ts not found)");
  }
}

function loadToolsRegistry(): { tools: ToolRegistry } {
  // Read the debug-time profile (with 127.0.0.1 added to external
  // tool network_hosts) instead of the real config/tool-profiles.json.
  const target = process.env.__CC_DEBUG_PROFILE_PATH__;
  if (!target || !existsSync(target)) {
    throw new Error(`debug profile path missing or unreadable: ${target}`);
  }
  const toolsRaw = readFileSync(target, "utf8");
  const tools = JSON.parse(toolsRaw);
  validateToolRegistry(tools);
  return { tools: tools as ToolRegistry };
}

main().catch((e) => {
  console.error("[harness] fatal:", e);
  process.exit(2);
});
