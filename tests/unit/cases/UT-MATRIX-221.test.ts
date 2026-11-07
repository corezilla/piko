/**
 * Case ID: UT-MATRIX-221  ·  STATUS: real
 *
 * 责任：throw L95 cannot resolve Matrix media UR（matrix.ts:91）
 * 维度坐标：`downloadMedia` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-221.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-221 · downloadMedia · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared unresolvable-URL error", async () => {
    // 步骤 1：构造 store、runtime 与一个解析不出 URL 的 client
    const store = newStore();
    try {
      const matrix = runtimeWith(store, { mxcUrlToHttp: () => undefined });

      // 步骤 2：调用 downloadMedia
      await expect(
        (matrix as unknown as { downloadMedia(r: string, e: string, c: unknown): Promise<string> }).downloadMedia(
          "run",
          "$event",
          { body: "x.txt", url: "mxc://test/x", info: { size: 4, mimetype: "text/plain" } },
        ),
      ).rejects.toThrow("cannot resolve Matrix media URL");
    } finally {
      store.close();
    }
  });

});
