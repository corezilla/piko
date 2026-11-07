/**
 * Case ID: UT-MATRIX-206  ·  STATUS: real
 *
 * 责任：分支 L94 || : typeof declaredMime!=="string"||!this.conf
 * 维度坐标：`downloadMedia` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-206.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-206 · downloadMedia · 状态分支 × 合法迁移", () => {
  it("rejects a download with a non-string MIME type", async () => {
    // 步骤 1：构造 store、runtime 与 client 替身（每个 Case 独立的 staging 根）
    const store = newStore();
    const { mkdtemp, rm } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const stagingRoot = await mkdtemp(join(tmpdir(), "piko-matrix-"));
    try {
      const stagingRoot = await mkdtemp(join(tmpdir(), "piko-matrix-"));
      const matrix = runtimeWith(store, { mxcUrlToHttp: () => "https://matrix.test/file" }, true, {
        ...config,
        workspace: { staging_root: stagingRoot },
      } as RuntimeConfig);

      // 步骤 2：调用 downloadMedia（mimetype 不是字符串）
      await expect(
        (matrix as unknown as { downloadMedia(r: string, e: string, c: unknown): Promise<string> }).downloadMedia(
          "run",
          "$event",
          { body: "x.txt", url: "mxc://test/x", info: { size: 4, mimetype: 42 } },
        ),
      ).rejects.toThrow(/MIME/);
    } finally {
      store.close();
    }
  });

});
