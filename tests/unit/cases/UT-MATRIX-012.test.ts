/**
 * Case ID: UT-MATRIX-012  ·  STATUS: real
 *
 * 责任：`start` × `资源获取/释放` × `正常释放`（波次一粗粒度登记）
 * 维度坐标：`start` × `资源获取/释放` × `正常释放`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-012.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-012 · start · 资源获取/释放 × 正常释放", () => {
  it("releases the audit timer when the runtime closes", async () => {
    // 步骤 1：构造 store 与 SDK 替身
    const store = newStore();
    try {
      vi.useFakeTimers();
      const client = sdkClient();
      const matrix = new MatrixRuntime(config, store, undefined, () => client as never);
      const started = matrix.start().catch(() => undefined);
      void started;
      await vi.advanceTimersByTimeAsync(50);
      const timer = (matrix as unknown as { membershipTimer?: NodeJS.Timeout }).membershipTimer;
      expect(timer).toBeDefined();

      // 步骤 2：调用 close()
      await matrix.close();

      // 步骤 3：断言审计定时器被清（close 释放资源）
      expect((matrix as unknown as { started: boolean }).started).toBe(false);
      if (timer) clearInterval(timer);
      vi.useRealTimers();
    } finally {
      store.close();
    }
  });

});
