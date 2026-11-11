/**
 * 公共替身：skill-tools（mem0_lookup / mem0_record）单元测试共用。
 *
 * 提供三样东西：
 * - fakeMem0()：结构相同的假 Mem0Adapter（只有 search / add 两个方法），
 *   把传给 mem0 的原始参数一字不改地记下来，供 Case 逐值对账
 *   （query、user_id、max_results、messages、metadata）；
 * - skillContext() / fakeInvocation()：合法等价类的上下文与调用替身；
 * - runExecute()：execute 的调用垫片——默认参数取合法等价类，Case 只需
 *   覆盖自己那一个参数。
 *
 * 逐值判据留在各自的 Case 脚本里（用例文档 §3.1 是唯一依据）。
 */
import { vi } from "vitest";
import { BACKGROUND_CONTEXT } from "../../../../upstream/pi/packages/agent/src/harness/context.ts";
import type { AgentHarnessToolInvocation } from "../../../../upstream/pi/packages/agent/src/harness/types.ts";
import type { ExecutionToolContext } from "../../../../upstream/pi/packages/agent/src/harness/tools/tool-context.ts";
import { DurableNodeExecutionEnv } from "../../../../src/durable-fs.js";
import type { Mem0Adapter, Mem0SearchResult } from "../../../../src/mem0-client.js";
import type { SkillToolContext } from "../../../../src/skill-tools.js";

/** 传给假 mem0 的 search 参数（原样记录，未做任何加工）。 */
export interface FakeSearchCall {
  query: string;
  user_id: string;
  options: { max_results?: number } | undefined;
}

/** 传给假 mem0 的 add 参数（原样记录，未做任何加工）。 */
export interface FakeAddCall {
  messages: Array<{ role: string; content: string }>;
  user_id: string;
  metadata: Record<string, any> | undefined;
}

/** 假 mem0 的行为开关。 */
export interface FakeMem0Options {
  /** search 的正常返回（默认空数组＝无匹配）。 */
  results?: Mem0SearchResult[];
  /** add 的正常返回（默认空 id 数组）。 */
  ids?: string[];
  /** search 抛出的东西（给定时原样抛出）。 */
  searchError?: unknown;
  /** add 抛出的东西（给定时原样抛出）。 */
  addError?: unknown;
}

export interface FakeMem0 {
  /** 可直接塞进 SkillToolDeps.mem0 的替身。 */
  mem0: Mem0Adapter;
  /** 被调用的原始参数，按调用序排列。 */
  calls: { search: FakeSearchCall[]; add: FakeAddCall[] };
}

/** 造一个结构相同的假 Mem0Adapter：只实现 search / add，不碰网络。 */
export function fakeMem0(opts: FakeMem0Options = {}): FakeMem0 {
  const calls: { search: FakeSearchCall[]; add: FakeAddCall[] } = {
    search: [],
    add: [],
  };
  const search = vi.fn(
    async (query: string, user_id: string, options?: { max_results?: number }) => {
      calls.search.push({ query, user_id, options });
      if (opts.searchError !== undefined) throw opts.searchError;
      return opts.results ?? [];
    },
  );
  const add = vi.fn(
    async (
      messages: Array<{ role: string; content: string }>,
      user_id: string,
      metadata?: Record<string, any>,
    ) => {
      calls.add.push({ messages, user_id, metadata });
      if (opts.addError !== undefined) throw opts.addError;
      return { ids: opts.ids ?? [] };
    },
  );
  return { mem0: { search, add } as unknown as Mem0Adapter, calls };
}

/** 造一份合法的 skill-tools 上下文（各 Case 只覆盖自己关心的字段）。 */
export function skillContext(
  overrides: Partial<SkillToolContext> = {},
): SkillToolContext {
  return { role: "tester", projectName: "piko", taskId: "task-1", ...overrides };
}

/** 造一个 invocation 替身（getMemo / setMemo 是真的最小实现）。 */
export function fakeInvocation(
  overrides: Partial<AgentHarnessToolInvocation> = {},
): AgentHarnessToolInvocation {
  const memos = new Map<string, any>();
  const base = {
    invocationId: "inv-1",
    operationId: "op-1",
    turnId: "turn-1",
    getMemo: async (name: string) => memos.get(name),
    setMemo: async (name: string, value: any) => {
      if (value === undefined) memos.delete(name);
      else memos.set(name, value);
    },
  };
  return { ...base, ...overrides } as AgentHarnessToolInvocation;
}

/** 造一个合法形状的 ExecutionToolContext（构造 env 不会碰文件系统）。 */
export function fakeToolContext(): ExecutionToolContext {
  return { env: new DurableNodeExecutionEnv({ cwd: "/tmp" }) };
}

/**
 * 固定时钟：让 mem0_record 里的 `new Date().toISOString()` 逐值可对账。
 * 返回还原函数，务必在 finally 里调用。
 */
export function fixedClock(iso = "2026-01-01T00:00:00.000Z"): () => void {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
  return () => vi.useRealTimers();
}

/**
 * execute 的调用垫片：默认参数取合法等价类，Case 只需覆盖自己那一个参数。
 * 覆盖项显式传 undefined／null 时按原值透传（不回落默认）。
 */
export async function runExecute(
  tool: { execute: (...args: any[]) => Promise<any> },
  params: unknown,
  args: Record<string, unknown> = {},
): Promise<any> {
  const merged: Record<string, unknown> = {
    toolCallId: "call-1",
    onUpdate: () => {},
    toolContext: {} as ExecutionToolContext,
    invocation: fakeInvocation(),
    context: BACKGROUND_CONTEXT,
    ...args,
  };
  return tool.execute(
    merged.toolCallId,
    params,
    merged.onUpdate,
    merged.toolContext,
    merged.invocation,
    merged.context,
  );
}
