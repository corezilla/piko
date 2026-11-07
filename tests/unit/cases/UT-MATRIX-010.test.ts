/**
 * Case ID: UT-MATRIX-010  ·  STATUS: real
 *
 * 责任：`start` × `资源获取/释放` × `获取失败路径`（波次一粗粒度登记）
 * 维度坐标：`start` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-010.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-010 · start · 资源获取/释放 × 获取失败路径", () => {
  it("rejects without a client when Matrix is disabled", async () => {
    // 步骤 1：构造 matrix.enabled 为 false 的 config
    const store = newStore();
    try {
      const disabled = { ...config, matrix: { ...config.matrix, enabled: false } } as RuntimeConfig;
      const matrix = new MatrixRuntime(disabled, store);

      // 步骤 2：调用 start()
      // 步骤 3：断言不建任何资源（无客户端、无审计定时器）
      await matrix.start();
      expect((matrix as unknown as { client: unknown }).client).toBeUndefined();
      expect((matrix as unknown as { membershipTimer?: NodeJS.Timeout }).membershipTimer).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
