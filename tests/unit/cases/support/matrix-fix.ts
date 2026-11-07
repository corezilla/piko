/**
 * 公共替身：MATRIX 单元测试共用。
 *
 * MatrixRuntime 的 client 被替换成这个替身——测试不连真实 homeserver，
 * 但调用序、参数与返回值与 SDK 一致。
 */
import { vi } from "vitest";
import { MatrixRuntime } from "../../../../src/matrix.js";
import { TaskStore } from "../../../../src/store.js";
import type { RuntimeConfig, TaskRequest } from "../../../../src/types.js";

export const config = {
  instance_id: "piko-test",
  workspace: { staging_root: "/tmp/piko-matrix-test" },
  matrix: {
    enabled: true,
    user_id: "@piko:test",
    homeserver: "https://matrix.test",
    max_media_bytes: 16,
    allowed_mime_types: ["text/plain"],
    sync_timeout_ms: 30000,
  },
} as unknown as RuntimeConfig;

export const task: TaskRequest = {
  task_id: "t",
  instruction: "x",
  workspace_ref: "repo",
  permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  discussion: { room_id: "!room:test", trigger_event_id: "$event" },
};

export function newStore(): TaskStore {
  return new TaskStore(":memory:", 1000);
}

/** 一个 Matrix 事件替身。 */
export function event(id: string, over: Record<string, unknown> = {}) {
  return {
    getType: () => "m.room.message",
    getRoomId: () => "!room:test",
    getId: () => id,
    getSender: () => "@user:test",
    getUnsigned: () => ({}),
    getContent: () => ({ msgtype: "m.text", body: "hello" }),
    ...over,
  };
}

/** 记录发送内容的 client 替身。 */
export function recordingClient() {
  const sent: { room: string; type: string; content: unknown; txnId: string }[] = [];
  return {
    sent,
    client: {
      sendEvent: async (room: string, type: string, content: unknown, txnId: string) => {
        sent.push({ room, type, content, txnId });
        return { event_id: "$sent" };
      },
    },
  };
}

/** 一个已注入 client、且 started 为真的 runtime。 */
export function runtimeWith(
  store: TaskStore,
  client: unknown,
  started = true,
  override?: RuntimeConfig,
): MatrixRuntime {
  const matrix = new MatrixRuntime(override ?? config, store) as unknown as {
    client: unknown;
    started: boolean;
  };
  matrix.client = client;
  matrix.started = started;
  return matrix as unknown as MatrixRuntime;
}

/** 一个独立的临时 staging 根——downloadMedia 的多个 Case 不能共用一个目录
 *  （它们会写同名文件并互相 rename 冲突）。 */
export async function withStaging<T>(fn: (root: string) => Promise<T>): Promise<T> {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-matrix-"));
  try {
    return await fn(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

/**
 * 一个 Matrix SDK 替身：记录调用，不连真实 homeserver。
 * start() 的每个分支都靠它驱动——同步回调由 on() 收下，由用例自己触发。
 */
export function sdkClient(over: Record<string, unknown> = {}) {
  const base: Record<string, unknown> = {
    whoami: vi.fn(async () => ({ user_id: "@piko:test" })),
    on: vi.fn(),
    store: { setSyncToken: vi.fn() },
    startClient: vi.fn(async () => {}),
    getSyncStateData: vi.fn(() => ({ nextSyncToken: "cursor-1" })),
    stopClient: vi.fn(),
    removeAllListeners: vi.fn(),
  };
  return { ...base, ...over };
}

/** 收集 SDK 替身上按事件名注册的监听器（用于触发同步回调）。 */
export function listenersOf(on: unknown): Map<string, (state: string) => void> {
  const map = new Map<string, (state: string) => void>();
  const fn = (on as { mock?: { calls: [string, (state: string) => void][] } }).mock;
  for (const [event, handler] of fn?.calls ?? []) map.set(event, handler);
  return map;
}

/**
 * start() 内部自己调 createClient 造 client，所以「注入 client」这条路走不通
 * （它会被覆盖）。这里给 SDK 造一个缝：case 文件用 vi.mock 把 createClient
 * 换成返回 sdkStub.current，Case 只需先往 sdkStub.current 放替身。
 */
