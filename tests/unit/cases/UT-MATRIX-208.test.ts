/**
 * Case ID: UT-MATRIX-208  ·  STATUS: real
 *
 * 责任：分支 L94 ?. : this.config.matrix.allowed_mime_types?.inc（matrix.ts）
 * 维度坐标：`downloadMedia` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-208.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-208 · downloadMedia · 状态分支 × 合法迁移", () => {
  it("rejects everything when no MIME type is allowed", async () => {
    // 步骤 1：构造 allowed_mime_types 为空的 config
    const store = newStore();
    try {
      const noMime = {
        ...config,
        matrix: { ...config.matrix, allowed_mime_types: [] },
      } as RuntimeConfig;
      const matrix = new MatrixRuntime(noMime, store) as unknown as { client: unknown };
      matrix.client = { mxcUrlToHttp: () => "https://matrix.test/file" };

      // 步骤 2：调用 downloadMedia（任何 MIME 都被拒）
      await expect(
        (matrix as unknown as { downloadMedia(r: string, e: string, c: unknown): Promise<string> }).downloadMedia(
          "run",
          "$event",
          { body: "x.txt", url: "mxc://test/x", info: { size: 4, mimetype: "text/plain" } },
        ),
      ).rejects.toThrow(/MIME/);
    } finally {
      store.close();
    }
  });

});
