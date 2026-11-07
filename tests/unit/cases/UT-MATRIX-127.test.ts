/**
 * Case ID: UT-MATRIX-127  ·  STATUS: real
 *
 * 责任：返回站点 L22 值 `（无值 return：提前退出）` 逐值断言（matrix.ts）
 * 维度坐标：`start` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-127.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-127 · start · 纯函数/无副作用 × 每等价类合法值", () => {
  it("does not settle before the initial sync arrives", async () => {
    // 步骤 1：构造 store 与 SDK 替身
    const store = newStore();
      vi.useFakeTimers();
      const on = vi.fn();
      const whoami = vi.fn(async () => ({ user_id: "@piko:test" }));
      const startClient = vi.fn(async () => {});
      const getSyncStateData = vi.fn(() => ({ nextSyncToken: "cursor-1" }));
      const stopClient = vi.fn();
      const client = sdkClient({ on, whoami, startClient, getSyncStateData, stopClient });
      const matrix = new MatrixRuntime(config, store, undefined, () => client as never);
    try {
      // 步骤 2：调用 start()
      const started = matrix.start().then(() => "resolved" as const).catch(() => "rejected" as const);

      // 步骤 3：断言它还没 settle（初始同步未完成）——假定时器下用推进时间代替竞速
      await vi.advanceTimersByTimeAsync(50);
      let settled = false;
      void started.then(() => { settled = true; });
      await vi.advanceTimersByTimeAsync(0);
      expect(settled).toBe(false);
    } finally {
      const timer = (matrix as unknown as { membershipTimer?: NodeJS.Timeout }).membershipTimer;
      if (timer) clearInterval(timer);
      vi.useRealTimers();
      store.close();
    }
  });

});
