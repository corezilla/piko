/**
 * Case ID: UT-MATRIX-118  ·  STATUS: real
 *
 * 责任：throw L18 `Matrix credential identity mismatch`（守卫 `if (who.user_id!==this.config.matrix.user_id)`；matrix.ts）
 * 维度坐标：`start` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-118.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-118 · start · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared identity-mismatch error", async () => {
    // 步骤 1：构造 store 与一个身份不符的 SDK 替身
    const store = newStore();
    const client = sdkClient({ whoami: vi.fn(async () => ({ user_id: "@someone:else" })) });
    const matrix = new MatrixRuntime(config, store, undefined, () => client as never);
    try {
      // 步骤 2：调用 start()
      // 步骤 3：断言 typed 错误逐值对账（凭据身份不符即拒）
      await expect(matrix.start()).rejects.toThrow("Matrix credential identity mismatch");
    } finally {
      store.close();
    }
  });

});
