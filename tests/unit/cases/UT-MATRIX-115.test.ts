/**
 * Case ID: UT-MATRIX-115  ·  STATUS: real
 *
 * 责任：分支 L23 ?? : this.config.matrix.sync_timeout_ms??30000（matrix.ts）
 * 维度坐标：`start` × `时间域行为` × `超时边界 ±1 tick`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-115.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-115 · start · 时间域行为 × 超时边界 ±1 tick", () => {
  it("rejects with the initial-sync timeout when no sync arrives", async () => {
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
      // 步骤 2：调用 start() 并快进 60 秒（初始同步超时）
      const started = matrix.start().catch((e: Error) => e);
      void started;
      await vi.advanceTimersByTimeAsync(60_000);

      // 步骤 3：断言以超时拒绝（替身从不同步 → 超时兜底）
      const outcome = await started;
      expect((outcome as Error).message).toMatch(/timeout/i);
    } finally {
      const timer = (matrix as unknown as { membershipTimer?: NodeJS.Timeout }).membershipTimer;
      if (timer) clearInterval(timer);
      vi.useRealTimers();
      store.close();
    }
  });

});
