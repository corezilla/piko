/**
 * 公共替身：WORKER 的 exec-process 单元测试共用。
 *
 * `runExecutionProcess` 是 P1 的入口：读配置、解析密钥、开库、起 Matrix 与 Pi、
 * 跑 worker。每一处都是外部依赖，故这里给出一套可编排的 deps。
 */
import { vi } from "vitest";
import type { ExecutionProcessDeps } from "../../../../src/exec-process.js";
import type { RuntimeConfig } from "../../../../src/types.js";

/** 一个够用的运行配置（字段按运行时真正读到的那些给）。 */
export const runtimeConfig = (over: Record<string, unknown> = {}): RuntimeConfig =>
  ({
    instance_id: "piko-test",
    task_store: { sqlite_path: ":memory:", busy_timeout_ms: 1000 },
    llmtier: { api_key_secret_ref: "env:PIKO_UT_LLM_KEY" },
    matrix: { enabled: false },
    workspace: { roots: { piko: "/tmp/piko-exec-test" }, staging_root: "/tmp/piko-exec-test/staging" },
    tools: { profile_registry_path: "/tmp/piko-exec-test/tool-profiles.json" },
    ...over,
  }) as unknown as RuntimeConfig;

/** 一次 runExecutionProcess 的记录：每一步调用了什么。 */
export interface ExecRun {
  configPaths: string[];
  roots: string[];
  secrets: string[];
  openedStores: { path: string; busyTimeoutMs: number }[];
  matrixTokens: (string | undefined)[];
  matrixStarted: number;
  matrixClosed: number;
  piClosed: number;
  storesClosed: number;
  workerStarted: number;
  workerClosed: number;
  aborted: string[];
  commands: string[];
}

/**
 * 一套可编排的 deps。
 *
 * `config` 决定配置；`secret` 决定每次 resolveSecret 的返回值或抛出的错误；
 * `failAt` 决定哪个协作者在构造时抛错。
 */
export function execDeps(over: {
  config?: RuntimeConfig;
  secret?: (ref: string) => Promise<string>;
  failAt?: "loadConfig" | "resolveSecret" | "matrixStart" | "workerClose" | "matrixClose" | "piClose";
  storeCloseThrows?: boolean;
} = {}) {
  const run: ExecRun = {
    configPaths: [],
    roots: [],
    secrets: [],
    openedStores: [],
    matrixTokens: [],
    matrixStarted: 0,
    matrixClosed: 0,
    piClosed: 0,
    storesClosed: 0,
    workerStarted: 0,
    workerClosed: 0,
    aborted: [],
    commands: [],
  };

  const config = over.config ?? runtimeConfig();

  const deps: ExecutionProcessDeps = {
    loadConfig: vi.fn(async (path: string, root?: string) => {
      run.configPaths.push(path);
      run.roots.push(root ?? "");
      if (over.failAt === "loadConfig") throw new Error("config unreadable");
      return { config, tools: { profile_version: "0.3", recovery_contracts: {}, profiles: {} } as never };
    }) as unknown as ExecutionProcessDeps["loadConfig"],
    resolveSecret: vi.fn(async (ref: string) => {
      run.secrets.push(ref);
      if (over.failAt === "resolveSecret") throw new Error(`missing secret ${ref}`);
      return over.secret ? over.secret(ref) : `secret-for:${ref}`;
    }),
    openStore: vi.fn((path: string, busyTimeoutMs: number) => {
      run.openedStores.push({ path, busyTimeoutMs });
      return {
        close: () => {
          run.storesClosed += 1;
          if (over.storeCloseThrows) throw new Error("store close failed");
        },
      };
    }),
    createMatrix: vi.fn((_config, _store, token) => {
      run.matrixTokens.push(token);
      return {
        start: async () => {
          run.matrixStarted += 1;
          if (over.failAt === "matrixStart") throw new Error("matrix start failed");
        },
        close: async () => {
          run.matrixClosed += 1;
          if (over.failAt === "matrixClose") throw new Error("matrix close failed");
        },
      };
    }),
    createPi: vi.fn(() => ({
      close: async () => {
        run.piClosed += 1;
        if (over.failAt === "piClose") throw new Error("pi close failed");
      },
    })),
    createTransfer: vi.fn(() => ({})),
    createWorker: vi.fn(() => ({
      start: () => {
        run.workerStarted += 1;
      },
      close: async () => {
        run.workerClosed += 1;
        if (over.failAt === "workerClose") throw new Error("worker close failed");
      },
      requestAbort: (taskId: string) => {
        run.aborted.push(taskId);
      },
    })),
    createChannel: vi.fn((onCommand) => {
      run.commands.push("channel-created");
      return { report: vi.fn(async () => ({ ok: true })) };
    }),
  };

  return { deps, run };
}
