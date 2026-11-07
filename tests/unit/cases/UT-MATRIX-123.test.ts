/**
 * Case ID: UT-MATRIX-123  ·  STATUS: real
 *
 * 责任：资源操作 L25 `setInterval`（matrix.ts）
 * 维度坐标：`start` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-123.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-123 · start · 资源获取/释放 × 获取失败路径", () => {
  it("does not leak the audit timer when start fails on identity mismatch", async () => {
    // 步骤 1：构造 store 与一个身份不符的 SDK 替身
    const store = newStore();
    const client = sdkClient({ whoami: vi.fn(async () => ({ user_id: "@other:test" })) });
    const matrix = new MatrixRuntime(config, store, undefined, () => client as never);
    try {
      // 步骤 2：调用 start() —— 身份校验失败即退出
      await expect(matrix.start()).rejects.toThrow(/identity mismatch/);

      // 步骤 3：断言没有装上审计定时器（失败路径不占资源）
      expect((matrix as unknown as { membershipTimer?: NodeJS.Timeout }).membershipTimer).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
