/**
 * Case ID: UT-MATRIX-197  ·  STATUS: real
 *
 * 责任：分支 L92 || : !this.client||typeof content.url!=="string
 * 维度坐标：`downloadMedia` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-197.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-197 · downloadMedia · 状态分支 × 合法迁移", () => {
  it("rejects a download without a client", async () => {
    // 步骤 1：构造没有 client 的 runtime
    const store = newStore();
    try {
      const matrix = runtimeWith(store, undefined, true);

      // 步骤 2：调用 downloadMedia
      // 步骤 3：断言被拒
      await expect(
        (matrix as unknown as { downloadMedia(r: string, e: string, c: unknown): Promise<string> }).downloadMedia(
          "run",
          "$event",
          { body: "x.txt", url: "mxc://test/x", info: { size: 4, mimetype: "text/plain" } },
        ),
      ).rejects.toThrow(/media URL/);
    } finally {
      store.close();
    }
  });

});
