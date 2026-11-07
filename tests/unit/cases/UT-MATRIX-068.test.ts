/**
 * Case ID: UT-MATRIX-068  ·  STATUS: real
 *
 * 责任：分支 L117 if : if (this.client)（matrix.ts）
 * 维度坐标：`close` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-068.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-068 · close · 状态分支 × 合法迁移", () => {
  it("stops the client and clears the started flag", async () => {
    // 步骤 1：构造 runtime 与 client 替身（记录 stopClient 调用）
    const store = newStore();
    const stopped: string[] = [];
    try {
      const matrix = runtimeWith(store, {
        stopClient: () => stopped.push("stop"),
        removeAllListeners: () => stopped.push("removeListeners"),
      });

      // 步骤 2：调用 close()
      await matrix.close();

      // 步骤 3：断言客户端被停、监听被摘、started 被清
      expect(stopped).toEqual(["stop", "removeListeners"]);
      expect((matrix as unknown as { started: boolean }).started).toBe(false);
    } finally {
      store.close();
    }
  });

});
