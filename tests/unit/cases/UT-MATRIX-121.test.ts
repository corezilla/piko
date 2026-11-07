/**
 * Case ID: UT-MATRIX-121  ·  STATUS: real
 *
 * 责任：状态写 L25 → `this.membershipTimer`（matrix.ts）
 * 维度坐标：`start` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-121.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-121 · start · 状态分支 × 合法迁移", () => {
  it("arms the periodic membership audit", async () => {
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
      const started = matrix.start().catch(() => undefined);
      void started;
      await vi.advanceTimersByTimeAsync(50);

      // 步骤 3：断言审计定时器已装上（成员漂移不靠事件流发现）
      expect((matrix as unknown as { membershipTimer?: NodeJS.Timeout }).membershipTimer).toBeDefined();
    } finally {
      const timer = (matrix as unknown as { membershipTimer?: NodeJS.Timeout }).membershipTimer;
      if (timer) clearInterval(timer);
      vi.useRealTimers();
      store.close();
    }
  });

});
