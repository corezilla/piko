/**
 * Case ID: UT-MATRIX-225  ·  STATUS: real
 *
 * 责任：throw L96（守卫 `if (!response.ok||!response.body)`；matrix.ts:91）
 * 维度坐标：`downloadMedia` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-225.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-225 · downloadMedia · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared download-failed error", async () => {
    // 步骤 1：构造 store、runtime 与 client 替身
    const store = newStore();
    const { mkdtemp, rm } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const stagingRoot = await mkdtemp(join(tmpdir(), "piko-matrix-"));
    try {
      const matrix = runtimeWith(store, { mxcUrlToHttp: () => "https://matrix.test/file" }, true, {
        ...config,
        workspace: { staging_root: stagingRoot },
      } as RuntimeConfig);
      vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));

      // 步骤 2：调用 downloadMedia
      await expect(
        (matrix as unknown as { downloadMedia(r: string, e: string, c: unknown): Promise<string> }).downloadMedia(
          "run",
          "$event",
          { body: "x.txt", url: "mxc://test/x", info: { size: 4, mimetype: "text/plain" } },
        ),
      ).rejects.toThrow(/Matrix media download failed: 500/);
    } finally {
      store.close();
      vi.unstubAllGlobals();
      await rm(stagingRoot, { recursive: true, force: true });
    }
  });

});
