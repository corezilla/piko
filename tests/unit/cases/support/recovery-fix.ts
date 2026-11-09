/**
 * 公共替身：WORKER 的 tool-recovery 单元测试共用。
 *
 * tool-recovery.ts 操作 Pi 的文件工具，故需要一个真的 env（DurableNodeExecutionEnv）
 * 与一个真的 invocation（memo 存储）。这里把两者封好，并给出几个可编排的
 * env 替身（fileInfo / readTextFile 失败）。
 */
import { vi } from "vitest";
import { BACKGROUND_CONTEXT } from "../../../../upstream/pi/packages/agent/src/harness/context.ts";
import type { AgentHarnessToolInvocation } from "../../../../upstream/pi/packages/agent/src/harness/types.ts";
import type { JsonValue } from "../../../../upstream/pi/packages/agent/src/harness/session/types.ts";
import { DurableNodeExecutionEnv } from "../../../../src/durable-fs.js";
import type { ToolPolicy, ToolRegistry } from "../../../../src/config.js";

/** 一个带 memo 存储的 invocation。 */
export function invocation() {
  const memos = new Map<string, JsonValue>();
  return {
    memos,
    value: {
      invocationId: "i",
      operationId: "o",
      turnId: "t",
      getMemo: async (name: string) => memos.get(name),
      setMemo: async (name: string, value: JsonValue) => {
        if (value === undefined) memos.delete(name);
        else memos.set(name, value);
      },
    } satisfies AgentHarnessToolInvocation,
  };
}

/** 一个真 env（cwd 指向给定的目录）。 */
export function envAt(cwd: string) {
  return new DurableNodeExecutionEnv({ cwd });
}

/** 工具上下文：真 env ＋ Pi 的后台 context。 */
export function toolContext(cwd: string) {
  return { env: envAt(cwd) };
}

/** Pi 的后台 context（文件工具只读它的 abortSignal）。 */
export const context = BACKGROUND_CONTEXT;

/** 一个注册表：带一个指向 builtin:workspace-atomic-write 的恢复契约。 */
export const registry: ToolRegistry = {
  profile_version: "0.3",
  recovery_contracts: {
    atomic: { kind: "stable_deduplication", implementation_ref: "builtin:workspace-atomic-write" },
  },
  profiles: {},
} as unknown as ToolRegistry;

/** 一个空的注册表：没有任何恢复契约。 */
export const emptyRegistry: ToolRegistry = {
  profile_version: "0.3",
  recovery_contracts: {},
  profiles: {},
} as unknown as ToolRegistry;

/** 可写型工具的策略：safe replay ＋ 指向 atomic 契约。 */
export const writePolicy: ToolPolicy = {
  effect: "workspace_write",
  replay: "safe",
  recovery_contract_ref: "atomic",
  permissions: { write_paths: [] },
} as unknown as ToolPolicy;

/** 只读型工具的策略。 */
export const readPolicy: ToolPolicy = {
  effect: "read_only",
  replay: "safe",
  permissions: { read_paths: [] },
} as unknown as ToolPolicy;

/** 永不重放的策略。 */
export const neverPolicy: ToolPolicy = {
  effect: "workspace_write",
  replay: "never",
  permissions: { write_paths: [] },
} as unknown as ToolPolicy;

/**
 * 一个假的 env：fileInfo / readTextFile 可编排。
 *
 * `fileInfo` 返回 Pi 的 `{ ok, value: { kind } }` 形状；
 * `readTextFile` 返回 `{ ok, value: string }`。
 */
export function fakeEnv(over: {
  fileInfo?: (path: string) => unknown;
  readTextFile?: (path: string) => unknown;
} = {}) {
  const env = {
    fileInfo: vi.fn(async (path: string) =>
      over.fileInfo ? over.fileInfo(path) : { ok: true, value: { kind: "file" } },
    ),
    readTextFile: vi.fn(async (path: string) =>
      over.readTextFile ? over.readTextFile(path) : { ok: true, value: "content" },
    ),
  };
  return env;
}
