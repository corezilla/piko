/**
 * 公共替身：pi-runtime（PiRuntime.constructor / execute / model / close）单元测试共用。
 *
 * 关键思路：
 * - `PiRuntime.execute` 会真的构造 upstream pi 的 AgentHarness 并驱动一次
 *   OpenAI Responses API 请求。harness 的 HTTP 客户端在每次请求时才从
 *   `globalThis.fetch` 取默认实现（openai SDK 的 getDefaultFetch），所以
 *   `vi.stubGlobal("fetch", …)` 足以把整个模型请求接住——不需要起本地服务。
 * - 返回体只要是一个 `text/event-stream` 的 SSE Response，按 Responses API
 *   的事件序吐几条事件即可让 harness 正常收尾。
 */
import { vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PiRuntime } from "../../../../src/pi-runtime.js";
import { TaskStore } from "../../../../src/store.js";
import type { Channel, Fact, FactOutcome } from "../../../../src/ipc.js";
import type { ToolRegistry, ToolPolicy } from "../../../../src/config.js";
import type { RuntimeConfig, TaskRequest } from "../../../../src/types.js";

/** 一份最小可用的 RuntimeConfig。 */
export function piConfig(over: Partial<RuntimeConfig> = {}): RuntimeConfig {
  return {
    identity: undefined,
    agent: { model: "test-model", profile_ref: "workspace-standard" },
    pi: { version: "0.85.1", commit: "0".repeat(40), session_root: join(tmpdir(), "piko-pi-sessions") },
    workspace: { roots: { piko: "/tmp" }, staging_root: "/tmp" },
    llmtier: { base_url: "http://llmtier.invalid/v1", api_key_secret_ref: "env:PIKO_LLM_API_KEY", models_timeout_ms: 5000 },
    ...over,
  } as unknown as RuntimeConfig;
}

/**
 * 构造 identity 段。
 *
 * `RuntimeConfig["identity"]` 把 `memory` 写成必填，但 PI 的构造器只按
 * 「配了 memory / 没配 memory」两态分支——`doc_search` 单独配置是合法的。
 * 用例要表达的是**分支语义**而不是类型完整性，所以这里放宽 memory 为可选，
 * 运行时行为与源码一致。
 */
export function piIdentity(over: {
  role?: string;
  name?: string;
  memory?: { provider?: "mem0"; api_key_secret_ref?: string; base_url?: string };
  doc_search?: { provider?: "graphrag"; api_key_secret_ref?: string; base_url?: string; default_scope?: string };
}): NonNullable<RuntimeConfig["identity"]> {
  return {
    role: over.role ?? "developer",
    name: over.name ?? "alice:developer",
    ...(over.memory ? { memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY", ...over.memory } as never } : {}),
    ...(over.doc_search ? { doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY", base_url: "https://graphrag.example.com", ...over.doc_search } as never } : {}),
  } as unknown as NonNullable<RuntimeConfig["identity"]>;
}

/** 一份最小可用的 ToolRegistry。缺省给一个空 profile 的 workspace-standard。 */
export function piTools(
  profiles: Record<string, Record<string, ToolPolicy>> = { "workspace-standard": {} },
  over: Partial<ToolRegistry> = {},
): ToolRegistry {
  return {
    profile_version: "test",
    recovery_contracts: {
      "builtin:workspace-atomic-write": {
        kind: "stable_deduplication",
        implementation_ref: "builtin:workspace-atomic-write",
      },
      "builtin:external-status": {
        kind: "external_status_query",
        implementation_ref: "builtin:external-status",
      },
    },
    profiles: Object.fromEntries(
      Object.entries(profiles).map(([name, tools]) => [name, { tools }]),
    ),
    ...over,
  } as ToolRegistry;
}

/** 一份最小可用的 TaskRequest。 */
export function piTask(id: string, over: Partial<TaskRequest> = {}): TaskRequest {
  return {
    task_id: id,
    instruction: "say hi",
    workspace_ref: "piko",
    permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
    output_paths: [],
    ...over,
  } as TaskRequest;
}

// ─── Responses API 的 SSE 构造 ─────────────────────────────────────

/** 把若干事件对象编成一条 SSE body。 */
export function sseBody(events: unknown[]): string {
  return (
    events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("") +
    "data: [DONE]\n\n"
  );
}

/** 一个只含文本输出的完成响应（单轮对话的全部事件）。 */
export function textResponseSse(text: string): string {
  const item = {
    id: "msg_1",
    type: "message",
    role: "assistant",
    status: "completed",
    content: [{ type: "output_text", text }],
  };
  return sseBody([
    { type: "response.created", response: { id: "resp_1", status: "in_progress" } },
    {
      type: "response.output_item.added",
      output_index: 0,
      item: { id: "msg_1", type: "message", role: "assistant", status: "in_progress", content: [] },
    },
    { type: "response.output_text.delta", output_index: 0, content_index: 0, delta: text },
    { type: "response.output_item.done", output_index: 0, item },
    {
      type: "response.completed",
      response: {
        id: "resp_1",
        status: "completed",
        output: [item],
        usage: { input_tokens: 3, output_tokens: 5, total_tokens: 8 },
      },
    },
  ]);
}

/** 一个含一次 function_call 的响应（模型请求调工具）。 */
export function toolCallSse(
  name: string,
  args: Record<string, unknown>,
  callId = "call_1",
): string {
  const raw = JSON.stringify(args);
  const item = {
    id: "fc_1",
    type: "function_call",
    call_id: callId,
    name,
    arguments: raw,
    status: "completed",
  };
  return sseBody([
    { type: "response.created", response: { id: "resp_1", status: "in_progress" } },
    {
      type: "response.output_item.added",
      output_index: 0,
      item: { ...item, status: "in_progress", arguments: "" },
    },
    { type: "response.function_call_arguments.delta", output_index: 0, delta: raw },
    { type: "response.output_item.done", output_index: 0, item },
    {
      type: "response.completed",
      response: {
        id: "resp_1",
        status: "completed",
        output: [item],
        usage: { input_tokens: 3, output_tokens: 5, total_tokens: 8 },
      },
    },
  ]);
}

/** SSE 形状的 Response。 */
export function sseResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/event-stream" },
  });
}

// ─── fetch 替身 ────────────────────────────────────────────────────

export interface StubFetchCall {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export type StubHandler = (
  call: StubFetchCall,
  index: number,
) => Response | Promise<Response>;

/**
 * 拦下 globalThis.fetch。handler 按调用次序决定返回什么；缺省返回一条
 * 完成文本。返回 `{calls, handler}`——`calls` 是逐次收到的请求。
 */
export function stubModelFetch(handler?: StubHandler) {
  const calls: StubFetchCall[] = [];
  const fallback = () => sseResponse(textResponseSse("done"));
  const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
    const url = typeof input === "string" ? input : (input as URL).toString();
    const headers: Record<string, string> = {};
    const h = init?.headers;
    if (h instanceof Headers) {
      for (const [k, v] of h.entries()) headers[k] = v;
    } else if (Array.isArray(h)) {
      for (const [k, v] of h) headers[String(k)] = String(v);
    } else if (h) {
      for (const [k, v] of Object.entries(h)) headers[k] = String(v);
    }
    const call: StubFetchCall = {
      url,
      method: init?.method,
      headers,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    };
    calls.push(call);
    return (handler ?? fallback)(call, calls.length - 1);
  });
  vi.stubGlobal("fetch", fetch as unknown as typeof fetch);
  return { calls, handler: handler ?? fallback };
}

// ─── Channel 替身 ──────────────────────────────────────────────────

/**
 * 记录每一个 fact 并按 kind 返回可编程的 value。
 * `values[kind]` 可以是常量，也可以是 `(fact, 该 kind 第几次) => value`
 * （例如让 closeIntake 前两次返回 false 再返回 true，用来安全地走到循环分支）。
 * 缺省：reserveModel → true，reserveTool → "Admitted"，closeIntake → true，
 * 其余 → {ok: true}。
 */
export type ChannelValue = unknown | ((fact: Fact, count: number) => unknown);

export function recordingChannel(
  values: Partial<Record<Fact["kind"], ChannelValue>> = {},
  /**
   * 把 `turn` 事实回写到 store。discussion 任务靠 store 的 pending turn 决定
   * 下一轮：若不回写，turn 永远停在 `Pending`，`execute` 的 drive 循环会
   * 反复重入同一个回合而永不收尾（G-UT-PI-10 记录的死循环）。
   */
  store?: TaskStore,
) {
  const facts: Fact[] = [];
  const counts = new Map<string, number>();
  const defaults: Partial<Record<Fact["kind"], unknown>> = {
    reserveModel: true,
    reserveTool: "Admitted",
    closeIntake: true,
  };
  const channel: Channel = {
    async report(fact: Fact): Promise<FactOutcome> {
      facts.push(fact);
      const count = (counts.get(fact.kind) ?? 0) + 1;
      counts.set(fact.kind, count);
      if (store && fact.kind === "turn") {
        store.markTurn(fact.task_id, fact.event_id, fact.status, fact.entry, fact.operation);
      }
      const resolve = (v: ChannelValue): unknown =>
        typeof v === "function" ? (v as (f: Fact, n: number) => unknown)(fact, count) : v;
      if (fact.kind in values) return { ok: true, value: resolve(values[fact.kind]!) };
      if (fact.kind in defaults) return { ok: true, value: defaults[fact.kind] };
      return { ok: true };
    },
  };
  return { channel, facts };
}

// ─── 整机装置 ──────────────────────────────────────────────────────

export interface PiFixtureOptions {
  config?: Partial<RuntimeConfig>;
  registry?: ToolRegistry;
  mem0ApiKey?: string;
  graphragApiKey?: string;
  transfer?: unknown;
  /** LLM key written to `PIKO_LLM_API_KEY`; defaults to "test-llm-key". */
  apiKey?: string;
  /** 传入一个已有的 store；缺省时本 helper 自建一个内存 store。 */
  store?: TaskStore;
}

/**
 * 只构造、不驱动 —— 用于 `PiRuntime.constructor` 的分支与状态写用例。
 *
 * 与 `piFixture` 的区别：本 helper **不吞掉构造期抛出的错误**，而是把它们
 * 连同 runtime 一起交回给用例（`error` 非空即构造失败），这样 fail-fast 分支
 * （缺 mem0/graphrag key）能被原样断言。
 *
 * 用完必须 `await fixture.close()`。
 */
export async function piConstructor(options: PiFixtureOptions = {}) {
  const root = await mkdtemp(join(tmpdir(), "piko-pi-ctor-"));
  const ownsStore = !options.store;
  const store = options.store ?? new TaskStore(":memory:", 1000);
  const recorded = recordingChannel();
  const config = piConfig({
    pi: { version: "0.85.1", commit: "0".repeat(40), session_root: join(root, "sessions") },
    ...options.config,
  });
  let runtime: PiRuntime | undefined;
  let error: unknown;
  try {
    runtime = new PiRuntime(
      config,
      options.registry ?? piTools(),
      store,
      recorded.channel,
      options.apiKey ?? "test-llm-key",
      options.mem0ApiKey,
      options.graphragApiKey,
      options.transfer as never,
    );
  } catch (e) {
    error = e;
  }
  return {
    root,
    store,
    config,
    /** 构造成功时的 runtime；构造抛错时为 undefined。 */
    runtime,
    /** 构造抛出的错误；构造成功时为 undefined。 */
    error,
    facts: recorded.facts,
    /** 读回构造后的私有状态（adapter / repo 等）。构造失败时返回 undefined。 */
    state<T = unknown>(key: string): T | undefined {
      if (!runtime) return undefined;
      return (runtime as unknown as Record<string, T>)[key];
    },
    async close() {
      if (runtime) await runtime.close();
      // 自建的 store 由本 helper 关闭；调用方传入的不动（由调用方负责）
      if (ownsStore) store.close();
      await rm(root, { recursive: true, force: true });
    },
  };
}

/**
 * 造一个可用的 PiRuntime（临时 session_root、内存 store、记录型 channel）。
 * 用完必须 `await fixture.close()`。
 */
export async function piFixture(options: PiFixtureOptions = {}) {
  const root = await mkdtemp(join(tmpdir(), "piko-pi-ut-"));
  const store = new TaskStore(":memory:", 1000);
  const recorded = recordingChannel({}, store);
  const config = piConfig({
    pi: { version: "0.85.1", commit: "0".repeat(40), session_root: join(root, "sessions") },
    ...options.config,
  });
  const runtime = new PiRuntime(
    config,
    options.registry ?? piTools(),
    store,
    recorded.channel,
    "test-llm-key",
    options.mem0ApiKey,
    options.graphragApiKey,
    options.transfer as never,
  );
  return {
    root,
    store,
    runtime,
    facts: recorded.facts,
    async close() {
      await runtime.close();
      store.close();
      await rm(root, { recursive: true, force: true });
    },
  };
}
