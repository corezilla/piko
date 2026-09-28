import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config.js";
import { TaskStore } from "../../src/store.js";
import { BearerAuth } from "../../src/auth.js";
import { MatrixRuntime } from "../../src/matrix.js";
import { ApiServer } from "../../src/server.js";
import { PiRuntime } from "../../src/pi-runtime.js";
import { RunWorker } from "../../src/worker.js";
import { Transfer } from "../../src/transfer.js";
import { preflightModelProvider } from "../../src/provider-preflight.js";
import { startMockLlmtier, type MockLlmtier, type ScriptStep } from "../common/mock-llmtier.js";
import Ajv, { type ValidateFunction } from "ajv/dist/2020.js";

/** Load LLMTier candidate.7 OpenAPI schemas for wire-conformance validation. */
async function llmtierValidator(def: "ResponsesRequest" | "ResponseStreamEvent"): Promise<ValidateFunction> {
  const doc = JSON.parse(await readFile("/Users/ben/work/LLMTier/interfaces/openapi/llmtier.openapi.json", "utf8"));
  const AjvCtor: any = (Ajv as any).default ?? Ajv;
  const ajv = new AjvCtor({ strict: false, allErrors: true });
  ajv.addSchema(doc, "llmtier-openapi");
  return ajv.compile({ $ref: `llmtier-openapi#/components/schemas/${def}` });
}

interface Stack {
  baseUrl: string;
  config: Awaited<ReturnType<typeof loadConfig>>["config"];
  store: TaskStore;
  mock: MockLlmtier;
  close(): Promise<void>;
}

async function makeStack(mock: MockLlmtier, opts?: { timeoutMs?: number }) {
  const root = await mkdtemp(join(tmpdir(), "piko-llmtier-"));
  const { config, tools } = await loadConfig("config/runtime.example.json");
  config.llmtier.base_url = mock.baseUrl;
  config.llmtier.models_timeout_ms = opts?.timeoutMs ?? 8000;
  config.workspace.roots.piko = root;
  config.pi.session_root = join(root, "pi-sessions");
  config.listen.port = 21000 + Math.floor(Math.random() * 20000);
  const store = new TaskStore(":memory:", 1000);
  const matrix = new MatrixRuntime(config, store);
  const server = await ApiServer.create(config, store, new BearerAuth("slinky", Buffer.from("test-token")), matrix);
  await server.listen();
  const pi = new PiRuntime(config, tools, store, "test-key");
  const worker = new RunWorker(config, store, pi, matrix, new Transfer(config));
  worker.start();
  const stack: Stack = {
    baseUrl: `http://127.0.0.1:${config.listen.port}`,
    config, store, mock,
    close: async () => {
      await worker.close();
      await server.close();
      await pi.close();
      matrix.close();
      store.close();
      await rm(root, { recursive: true, force: true });
    },
  };
  return stack;
}

function task(taskId: string, instruction: string, extra?: Partial<Record<string, unknown>>) {
  return {
    task_id: taskId,
    instruction,
    workspace_ref: "piko",
    permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
    output_paths: [],
    ...extra,
  };
}

async function submit(stack: Stack, body: unknown): Promise<{ status: number; taskId: string | null; json: any }> {
  const res = await fetch(`${stack.baseUrl}/tasks`, {
    method: "POST",
    headers: { authorization: "Bearer test-token", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json: any = await res.json();
  return { status: res.status, taskId: json.task_id ?? null, json };
}

async function waitTerminal(stack: Stack, taskId: string, timeoutMs = 60_000): Promise<any> {
  const start = Date.now();
  for (;;) {
    const view = stack.store.getRun(taskId);
    if (["Completed", "Failed", "Cancelled"].includes(view.state)) return stack.store.result(taskId);
    if (Date.now() - start > timeoutMs) throw new Error(`run ${taskId} not terminal after ${timeoutMs}ms (state=${view.state})`);
    await new Promise((r) => setTimeout(r, 100));
  }
}

function inputItems(mock: MockLlmtier, i: number): any[] {
  const body = mock.requests[i]?.body as any;
  return Array.isArray(body?.input) ? body.input : [];
}

describe("LLMTier consumption contract (mock, PK-T41..T54)", () => {
  it("PK-T41: request subset pins stream/store and excludes forbidden fields", async () => {
    const mock = await startMockLlmtier({ model: "piko-test-model", script: [{ kind: "completed", text: "ok" }] });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      const { taskId } = await submit(stack, task("t41", "reply ok"));
      expect(taskId).toBeTruthy();
      const result = await waitTerminal(stack, taskId!);
      expect(result.state).toBe("Completed");
      expect(mock.requests.length).toBeGreaterThanOrEqual(1);
      const first = mock.requests.find((r) => r.path.endsWith("/responses"))!;
      const body = first.body as any;
      expect(first.authorization).toMatch(/^Bearer /);
      expect(body.model).toBe(stack.config.agent.model);
      expect(body.stream).toBe(true);
      expect(body.store).toBe(false);
      expect("prompt_cache_key" in body).toBe(false);
      expect("prompt_cache_retention" in body).toBe(false);
      expect("prompt_cache_options" in body).toBe(false);
      expect("previous_response_id" in body).toBe(false);
      expect("task_id" in body).toBe(false);
      expect(Array.isArray(body.input)).toBe(true);
      expect(body.input.some((x: any) => x.type === "function_call_output")).toBe(false);
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 60_000);

  it("PK-T43: minimal required SSE event set completes a Run with exact usage passthrough", async () => {
    const mock = await startMockLlmtier({ model: "piko-test-model", script: [{ kind: "completed", text: "contract-ok", usage: "full" }] });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      const { taskId } = await submit(stack, task("t43", "say contract-ok"));
      const result = await waitTerminal(stack, taskId!);
      expect(result.state).toBe("Completed");
      expect(result.summary).toBe("contract-ok");
      expect(result.usage).toMatchObject({
        source: "PiModelResponses", quality: "Complete",
        input_tokens: 120, output_tokens: 8, total_tokens: 128,
        cache_read_tokens: 0, cache_write_tokens: 0, reasoning_tokens: 2,
        model_attempts: 1, usage_observed_attempts: 1,
      });
      expect(result.usage.missing_fields).toEqual([]);
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 60_000);

  it("PK-T47: usage optional-field absence degrades to Partial with nulls, never fabricated numbers", async () => {
    const mock = await startMockLlmtier({ model: "piko-test-model", script: [{ kind: "completed", text: "minimal usage", usage: "minimal" }] });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      const { taskId } = await submit(stack, task("t47", "minimal usage"));
      const result = await waitTerminal(stack, taskId!);
      expect(result.state).toBe("Completed");
      expect(result.usage.quality).toBe("Partial");
      expect(result.usage.input_tokens).toBe(10);
      expect(result.usage.output_tokens).toBe(5);
      expect(result.usage.total_tokens).toBe(15);
      expect(result.usage.cache_read_tokens).toBeNull();
      expect(result.usage.cache_write_tokens).toBeNull();
      expect(result.usage.reasoning_tokens).toBeNull();
      expect(result.usage.missing_fields).toEqual(["cache_read_tokens", "cache_write_tokens", "reasoning_tokens"]);
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 60_000);

  it("PK-T42: function_call drives the tool loop and the next input carries function_call_output", async () => {
    const mock = await startMockLlmtier({
      model: "piko-test-model",
      script: [
        { kind: "toolCall", toolName: "read", args: JSON.stringify({ path: "seed.txt" }), callId: "call_seed_1" },
        { kind: "completed", text: "tool loop done" },
      ],
    });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      await writeFile(join(stack.config.workspace.roots.piko, "seed.txt"), "seed-bytes-42");
      const { taskId } = await submit(stack, task("t42", "read seed.txt via tool", {
        permissions: { read_paths: ["seed.txt"], write_paths: [], tool_profile_ref: "workspace-standard" },
      }));
      const result = await waitTerminal(stack, taskId!);
      expect(result.state).toBe("Completed");
      expect(mock.requests.filter((r) => r.path.endsWith("/responses")).length).toBe(2);
      const second = mock.requests.filter((r) => r.path.endsWith("/responses"))[1]!.body as any;
      const outputs = second.input.filter((x: any) => x.type === "function_call_output");
      expect(outputs.length).toBeGreaterThanOrEqual(1);
      expect(outputs[0].call_id).toBe("call_seed_1");
      expect(JSON.stringify(outputs[0].output)).toContain("seed-bytes-42");
      expect(second.input.some((x: any) => x.type === "function_call" && x.call_id === "call_seed_1")).toBe(true);
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 60_000);

  it("PK-T44: response.incomplete(content_filter) never yields Completed", async () => {
    const mock = await startMockLlmtier({ model: "piko-test-model", loopLast: true, script: [{ kind: "incomplete", reason: "content_filter", text: "blocked" }] });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      const { taskId } = await submit(stack, task("t44", "try incomplete"));
      const result = await waitTerminal(stack, taskId!);
      expect(result.state).not.toBe("Completed");
      expect(result.state).toBe("Failed");
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 60_000);

  it("PK-T45: response.failed maps to a contract failure code, not InternalError", async () => {
    const mock = await startMockLlmtier({ model: "piko-test-model", loopLast: true, script: [{ kind: "failed", code: "server_error", message: "upstream blew up" }] });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      const { taskId } = await submit(stack, task("t45", "trigger failed event"));
      const result = await waitTerminal(stack, taskId!);
      expect(result.state).toBe("Failed");
      expect(result.failure!.code).toBe("ModelResponseInvalid");
      expect(result.failure!.cause_class).toBe("ModelProtocol");
      expect(result.failure!.message).toContain("upstream blew up");
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 60_000);

  it("PK-T46: refusal deltas are consumed and the run still completes", async () => {
    const mock = await startMockLlmtier({ model: "piko-test-model", script: [{ kind: "refusal", text: "Cannot comply with synthetic request" }] });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      const { taskId } = await submit(stack, task("t46-refusal", "trigger refusal"));
      const result = await waitTerminal(stack, taskId!);
      expect(result.state).toBe("Completed");
      expect(result.summary).toContain("Cannot comply");
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 60_000);

  it("wire conformance: Piko requests satisfy ResponsesRequest and mock events satisfy ResponseStreamEvent (LLMTier candidate.7)", async () => {
    const mock = await startMockLlmtier({
      model: "piko-test-model",
      script: [
        { kind: "toolCall", toolName: "read", args: JSON.stringify({ path: "seed.txt" }), callId: "call_wire_1", reasoning: { id: "rs_w", encrypted: "enc-wire", summary: "s" } },
        { kind: "completed", text: "wire ok", usage: "full" },
      ],
    });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      await writeFile(join(stack.config.workspace.roots.piko, "seed.txt"), "seed");
      const { taskId } = await submit(stack, task("wire-001", "wire conformance", {
        permissions: { read_paths: ["seed.txt"], write_paths: [], tool_profile_ref: "workspace-standard" },
      }));
      const result = await waitTerminal(stack, taskId!);
      expect(result.state).toBe("Completed");

      const validateRequest = await llmtierValidator("ResponsesRequest");
      const validateEvent = await llmtierValidator("ResponseStreamEvent");

      const requestErrors: string[] = [];
      for (const r of mock.requests.filter((x) => x.path.endsWith("/responses"))) {
        if (!validateRequest(r.body)) {
          requestErrors.push(...(validateRequest.errors ?? []).map((e) => `${e.instancePath} ${e.message}`));
        }
      }
      expect(requestErrors, `Piko request violates LLMTier ResponsesRequest: ${requestErrors.join("; ")}`).toEqual([]);

      const eventErrors: string[] = [];
      for (const e of mock.emitted) {
        if (!validateEvent(e)) {
          eventErrors.push(`${(e as any).type}: ${(validateEvent.errors ?? []).map((x) => `${x.instancePath} ${x.message}`).join("; ")}`);
        }
      }
      expect(eventErrors, `mock events violate LLMTier ResponseStreamEvent: ${eventErrors.join("; ")}`).toEqual([]);
      expect(mock.emitted.length).toBeGreaterThan(8);
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 90_000);

  it("PK-T46: opaque reasoning item is replayed byte-identical on the next request", async () => {
    const mock = await startMockLlmtier({
      model: "piko-test-model",
      script: [
        { kind: "toolCall", toolName: "read", args: JSON.stringify({ path: "seed.txt" }), callId: "call_rs_1", reasoning: { id: "rs_9", encrypted: "enc-bytes-46", summary: "thinking" } },
        { kind: "completed", text: "reasoning replay ok" },
      ],
    });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      await writeFile(join(stack.config.workspace.roots.piko, "seed.txt"), "seed");
      const { taskId } = await submit(stack, task("t46", "reasoning replay", {
        permissions: { read_paths: ["seed.txt"], write_paths: [], tool_profile_ref: "workspace-standard" },
      }));
      const result = await waitTerminal(stack, taskId!);
      expect(result.state).toBe("Completed");
      const second = mock.requests.filter((r) => r.path.endsWith("/responses"))[1]!.body as any;
      const rs = second.input.filter((x: any) => x.type === "reasoning");
      expect(rs.length).toBeGreaterThanOrEqual(1);
      expect(rs.some((x: any) => x.id === "rs_9" && x.encrypted_content === "enc-bytes-46")).toBe(true);
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 60_000);

  it("PK-T48: truncated SSE stream produces a new durable attempt with provider retry still zero", async () => {
    const mock = await startMockLlmtier({
      model: "piko-test-model",
      script: [
        { kind: "truncated", text: "half a stream" },
        { kind: "completed", text: "recovered after cut" },
      ],
    });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      const { taskId } = await submit(stack, task("t48", "survive truncation"));
      const result = await waitTerminal(stack, taskId!, 90_000);
      expect(result.state).toBe("Completed");
      const posts = mock.requests.filter((r) => r.path.endsWith("/responses")).length;
      expect(posts).toBe(2);
      const attempts = stack.store.rawUsage(taskId!);
      expect(result.usage.model_attempts).toBe(2);
      expect(result.usage.usage_observed_attempts).toBe(1);
      expect(attempts.length).toBe(1);
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 90_000);

  it("PK-T49: slow stream beyond models_timeout_ms fails closed without bypassing budget CAS", async () => {
    const mock = await startMockLlmtier({ model: "piko-test-model", script: [{ kind: "hang", ms: 30_000 }] });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock, { timeoutMs: 600 });
      const { taskId } = await submit(stack, task("t49", "hang forever"));
      const result = await waitTerminal(stack, taskId!, 90_000);
      expect(result.state).toBe("Failed");
      expect(["ModelUnavailable", "ModelResponseInvalid"]).toContain(result.failure!.code);
      const view = stack.store.getRun(taskId!);
      expect(view.progress.model_calls).toBeLessThanOrEqual(5);
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 90_000);

  it("PK-T50: HTML body with 200 maps to a clean contract failure", async () => {
    const mock = await startMockLlmtier({ model: "piko-test-model", script: [{ kind: "raw", status: 200, contentType: "text/html", body: "<html>gateway junk</html>" }] });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock, { timeoutMs: 3000 });
      const { taskId } = await submit(stack, task("t50", "malformed body"));
      const result = await waitTerminal(stack, taskId!, 90_000);
      expect(result.state).toBe("Failed");
      expect(["ModelUnavailable", "ModelResponseInvalid"]).toContain(result.failure!.code);
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 90_000);

  it.each([
    ["401", 401],
    ["429", 429],
    ["500", 500],
    ["503", 503],
  ])("PK-T51: HTTP %s from /v1/responses maps to a contract failure", async (_label, status) => {
    const mock = await startMockLlmtier({ model: "piko-test-model", script: [{ kind: "raw", status: status as number, contentType: "application/json", body: JSON.stringify({ error: { message: "http failure", type: "server_error" } }), headers: status === 429 ? { "retry-after": "7" } : {} }] });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock, { timeoutMs: 3000 });
      const { taskId } = await submit(stack, task(`t51-${status}`, "http status failure"));
      const result = await waitTerminal(stack, taskId!, 90_000);
      expect(result.state).toBe("Failed");
      expect(["ModelUnavailable", "ModelResponseInvalid"]).toContain(result.failure!.code);
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 90_000);

  it("PK-T51: preflight rejects a models list without the configured model and accepts a matching one", async () => {
    const missing = await startMockLlmtier({ model: "other-model", script: [] });
    try {
      await expect(preflightModelProvider(missing.baseUrl, "test-key", 2000, "piko-test-model")).rejects.toThrow();
    } finally {
      await missing.close();
    }
    const present = await startMockLlmtier({ model: "piko-test-model", script: [] });
    try {
      await expect(preflightModelProvider(present.baseUrl, "test-key", 2000, "piko-test-model")).resolves.toBeUndefined();
    } finally {
      await present.close();
    }
  }, 30_000);

  it("PK-T53: late usage after a published Result never mutates the published bytes", async () => {
    const mock = await startMockLlmtier({ model: "piko-test-model", script: [{ kind: "completed", text: "freeze me" }] });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      const { taskId } = await submit(stack, task("t53", "publish then late usage"));
      const result = await waitTerminal(stack, taskId!);
      const before = JSON.stringify(stack.store.result(taskId!));
      expect(before).toBe(JSON.stringify(result));
      const attempts = stack.store.rawUsage(taskId!);
      expect(attempts.length).toBe(1);
      // Parse op/step/attempt from known_actions ("op/step attempt N") since usage() returns raw JSON only.
      const description = result.known_actions.find((a: any) => a.kind === "ModelCall")!.description;
      const [opStep, attemptPart] = description.split(" attempt ");
      const [op, step] = opStep.split("/");
      stack.store.observeUsage(taskId!, op, step, Number(attemptPart), { input: 999, output: 999, totalTokens: 1998 });
      const after = JSON.stringify(stack.store.result(taskId!));
      expect(after).toBe(before);
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 60_000);

  it("PK-T54: full Slinky-role chain — submit, schema-valid result, idempotent resubmit, conflict, cancel-before-start", async () => {
    const mock = await startMockLlmtier({ model: "piko-test-model", script: [{ kind: "completed", text: "chain-ok" }], loopLast: true });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      const headers = { authorization: "Bearer test-token", "content-type": "application/json" };
      const body = task("t54", "full chain");
      const first = await fetch(`${stack.baseUrl}/tasks`, { method: "POST", headers, body: JSON.stringify(body) });
      expect(first.status).toBe(202);
      const run: any = await first.json();
      const result = await waitTerminal(stack, run.task_id);
      expect(result.state).toBe("Completed");

      const resultRes = await fetch(`${stack.baseUrl}/tasks/${run.task_id}/result`, { headers });
      expect(resultRes.status).toBe(200);

      const again = await fetch(`${stack.baseUrl}/tasks`, { method: "POST", headers, body: JSON.stringify(body) });
      expect(again.status).toBe(202);
      const againJson: any = await again.json();
      expect(againJson.task_id).toBe(run.task_id);

      const conflicted = await fetch(`${stack.baseUrl}/tasks`, {
        method: "POST", headers,
        body: JSON.stringify({ ...body, instruction: "different definition" }),
      });
      expect(conflicted.status).toBe(409);

      const queued = await fetch(`${stack.baseUrl}/tasks`, {
        method: "POST", headers,
        body: JSON.stringify(task("t54-cancel", "will be cancelled before start")),
      });
      const queuedRun: any = await queued.json();
      const cancel = await fetch(`${stack.baseUrl}/tasks/${queuedRun.task_id}:cancel`, { method: "POST", headers });
      expect([200, 202]).toContain(cancel.status);
      const cancelled = await waitTerminal(stack, queuedRun.task_id);
      expect(cancelled.state).toBe("Cancelled");

      const missing = await fetch(`${stack.baseUrl}/tasks/run-not-there`, { headers });
      expect(missing.status).toBe(404);
      const nonTerminal = await fetch(`${stack.baseUrl}/tasks/${run.task_id}/result`, { headers });
      expect(nonTerminal.status).toBe(200);
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 60_000);
});

describe("Offline gap closure — 09-18 live scenarios replayed against mock (PK-T41..T54)", () => {
  it("gap-1: write tool + output collection (path/sha256/size in Result)", async () => {
    const mock = await startMockLlmtier({
      model: "piko-test-model",
      script: [
        { kind: "toolCall", toolName: "write", args: JSON.stringify({ path: "out/gap1.txt", content: "gap-one-bytes" }), callId: "call_gap1" },
        { kind: "completed", text: "written" },
      ],
    });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      await mkdir(join(stack.config.workspace.roots.piko, "out"), { recursive: true });
      const { taskId } = await submit(stack, task("gap-write-1", "write it", {
        permissions: { read_paths: [], write_paths: ["out/gap1.txt"], tool_profile_ref: "workspace-standard" },
        output_paths: ["out/gap1.txt"],
      }));
      const result = await waitTerminal(stack, taskId!);
      expect(result.state).toBe("Completed");
      expect(result.outputs.length).toBe(1);
      expect(result.outputs[0].path).toBe("out/gap1.txt");
      expect(result.outputs[0].size_bytes).toBe(13);
      expect(result.outputs[0].sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(result.partial).toBe(false);
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 60_000);

  it("gap-2: cancellation while Pi is streaming maps to Cancelled/CancelledByRequest", async () => {
    const mock = await startMockLlmtier({ model: "piko-test-model", loopLast: true, script: [{ kind: "hang", ms: 30_000 }] });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock, { timeoutMs: 25_000 });
      const { taskId } = await submit(stack, task("gap-cancel-1", "will be cancelled mid-stream"));
      for (let i = 0; i < 100; i++) {
        if (stack.store.getRun(taskId!).state === "Running") break;
        await new Promise((r) => setTimeout(r, 200));
      }
      const { outcome } = await (async () => {
        const res = await fetch(`${stack.baseUrl}/tasks/${taskId}:cancel`, { method: "POST", headers: { authorization: "Bearer test-token" } });
        return { outcome: ((await res.json()) as any).outcome as string };
      })();
      expect(["StopRequested", "AlreadyTerminal"]).toContain(outcome);
      const result = await waitTerminal(stack, taskId!, 60_000);
      expect(result.state).toBe("Cancelled");
      expect(result.failure?.code).toBe("CancelledByRequest");
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 90_000);

  it("gap-3: retired (task-level limits removed, PK-04)", () => {
    // N/A · 本版撤销：任务级 deadline/预算已移除，该用例不再适用。
    expect(true).toBe(true);
  });

  it("gap-4: retired (task-level limits removed, PK-04)", () => {
    // N/A · 本版撤销：任务级 deadline/预算已移除，该用例不再适用。
    expect(true).toBe(true);
  });

  it("gap-5: scope denial is a formal ToolFailure, not a crash", async () => {
    const mock = await startMockLlmtier({
      model: "piko-test-model",
      script: [{ kind: "toolCall", toolName: "read", args: JSON.stringify({ path: "seed.txt" }), callId: "call_gap5" }],
      loopLast: true,
    });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      await writeFile(join(stack.config.workspace.roots.piko, "seed.txt"), "secret");
      const { taskId } = await submit(stack, task("gap-scope", "read unauthorized", {
        permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
      }));
      const result = await waitTerminal(stack, taskId!);
      expect(result.state).toBe("Failed");
      expect(result.failure?.code).toBe("ToolFailure");
      expect(result.failure?.cause_class).toBe("Tool");
      expect(result.failure?.message).toContain("outside task permissions");
      // The unauthorized bytes must not leak into the Result.
      expect(JSON.stringify(result)).not.toContain("secret");
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 60_000);

  it("gap-6: retired (task-level limits removed, PK-04)", () => {
    // N/A · 本版撤销：任务级 deadline/预算已移除，该用例不再适用。
    expect(true).toBe(true);
  });

  it("gap-7: two Runs keep independent Pi sessions (session isolation A/B)", async () => {
    const mock = await startMockLlmtier({
      model: "piko-test-model",
      loopLast: true,
      script: [{ kind: "completed", text: "ack" }],
    });
    let stack: Stack | undefined;
    try {
      stack = await makeStack(mock);
      const markerA = `SESSION_A_MARKER_${Date.now()}`;
      const markerB = `SESSION_B_MARKER_${Date.now()}`;
      const a = await submit(stack, task("gap-iso-a", `Memorize and repeat: ${markerA}`));
      const b = await submit(stack, task("gap-iso-b", `Memorize and repeat: ${markerB}`));
      const ra = await waitTerminal(stack, a.taskId!);
      const rb = await waitTerminal(stack, b.taskId!);
      expect(ra.state).toBe("Completed");
      expect(rb.state).toBe("Completed");

      const sessionRoot = stack.config.pi.session_root;
      const { execFileSync } = await import("node:child_process");
      const files = execFileSync("find", [sessionRoot, "-type", "f", "-name", "*.jsonl"]).toString().trim().split("\n").filter(Boolean);
      const fa = files.find((f) => f.includes(a.taskId!));
      const fb = files.find((f) => f.includes(b.taskId!));
      expect(fa, `session file for ${a.taskId} exists`).toBeTruthy();
      expect(fb, `session file for ${b.taskId} exists`).toBeTruthy();
      const contentA = await readFile(fa!, "utf8");
      const contentB = await readFile(fb!, "utf8");
      expect(contentA).toContain(markerA);
      expect(contentA).not.toContain(markerB);
      expect(contentB).toContain(markerB);
      expect(contentB).not.toContain(markerA);
    } finally {
      await mock.close();
      await stack?.close();
    }
  }, 90_000);
});
