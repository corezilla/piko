/**
 * 公共替身：TRANSFER 单元测试共用。
 *
 * transfer.ts 走 execFile 调真 scp/ssh；remote-exec.ts 的 spawn 是注入参数。
 * 这里给两处都留缝：真实文件系统 + 注入的 spawn/exec。
 */
import { vi } from "vitest";
import type { RuntimeConfig } from "../../../../src/types.js";

export const config = (over: Record<string, unknown> = {}) =>
  ({
    instance_id: "piko-test",
    workspace: { staging_root: "/tmp/piko-transfer-test", roots: { piko: "/tmp/piko-transfer-test" } },
    ...over,
    transfer: {
      method: "scp",
      port: 2222,
      known_hosts: "/tmp/piko-transfer-test/known_hosts",
      credential_ref: "env:PIKO_UT_SCP_KEY",
      target_allowlist: ["/remote/allowed", "/remote/allowed2"],
      max_input_bytes: 1024,
      retry: { max_attempts: 3, base_delay_ms: 10 },
      // 深合并：只覆盖调用方指定的 transfer 键，其余保持默认
      ...((over.transfer as Record<string, unknown>) ?? {}),
    },
  }) as unknown as RuntimeConfig;

/** 一个假的 transfer：只提供 sshCommandArgs（execRemote 用它建 argv）。 */
export function fakeTransfer(args: string[] = []) {
  const calls: { host: string; argv: readonly string[] }[] = [];
  return {
    calls,
    sshCommandArgs: vi.fn(async (host: string, argv: readonly string[]) => {
      calls.push({ host, argv });
      return [...args, "--", host, ...argv];
    }),
  };
}

/**
 * 工具结果里的文本内容。
 *
 * 工具的 content 是 `TextContent | ImageContent` 的并集，直接取 `.text`
 * 过不了类型检查；这个取法把「只有文本内容」这件事写明。
 */
export function textOf(result: { content: ReadonlyArray<{ type: string }> }): string {
  const first = result.content[0] as { type: string; text?: string } | undefined;
  return first?.text ?? "";
}

/**
 * 一个假的 spawn：execFile 形态（回调式），立刻回调一次结果，不起真进程。
 * 形态照 RemoteSpawner 的签名：spawn(args, options, callback) → { on(event, listener) }。
 */
export function fakeSpawn(
  result: { error?: (Error & { code?: unknown; killed?: boolean; signal?: string }) | null; stdout?: string; stderr?: string } = {},
) {
  const spawned: { args: readonly string[]; options: unknown }[] = [];
  const spawn = vi.fn(
    (
      args: readonly string[],
      options: unknown,
      callback: (
        error: (Error & { code?: unknown; killed?: boolean; signal?: string }) | null,
        stdout: string,
        stderr: string,
      ) => void,
    ) => {
      spawned.push({ args, options });
      queueMicrotask(() => callback(result.error ?? null, result.stdout ?? "", result.stderr ?? ""));
      return { on: () => {} };
    },
  );
  return { spawn, spawned };
}

/**
 * 一个假的 scp spawner：照 ScpSpawner 的签名（cmd, args, options, callback）。
 *
 * `outcomes` 逐次给出回调结果；给完以后重复最后一次（重试用）。
 * 每次调用都记下 cmd/args/options，故 retry 的次数与退避都可断言。
 */
export function fakeScp(
  outcomes: { error?: Error | null; stdout?: string; stderr?: string }[] = [{ error: null, stdout: "", stderr: "" }],
) {
  const calls: { cmd: string; args: string[]; options: { signal?: AbortSignal; timeout: number; maxBuffer: number } }[] = [];
  const spawn = vi.fn(
    (
      cmd: string,
      args: string[],
      options: { signal?: AbortSignal; timeout: number; maxBuffer: number },
      callback: (error: Error | null, stdout: string, stderr: string) => void,
    ) => {
      calls.push({ cmd, args: [...args], options });
      const outcome = outcomes[Math.min(calls.length - 1, outcomes.length - 1)]!;
      queueMicrotask(() => callback(outcome.error ?? null, outcome.stdout ?? "", outcome.stderr ?? ""));
    },
  );
  return { spawn, calls };
}
