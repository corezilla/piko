/**
 * Case ID: UT-MATRIX-002  ·  STATUS: real
 *
 * 责任：`downloadMedia` × `数值/长度上限参数` × `恰好通过`（波次一粗粒度登记）
 * 维度坐标：`downloadMedia` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-002.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-002 · downloadMedia · 数值/长度上限参数 × 恰好通过", () => {
  it("accepts a media whose declared size is exactly at the limit", async () => {
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
      vi.stubGlobal("fetch", vi.fn(async () => new Response("data", { headers: { "content-type": "text/plain" } })));

      // 步骤 2：调用 downloadMedia（声明大小在上限内）
      const visible = await (
        matrix as unknown as { downloadMedia(r: string, e: string, c: unknown): Promise<string> }
      ).downloadMedia("run", "$event", { body: "x.txt", url: "mxc://test/x", info: { size: 4, mimetype: "text/plain" } });

      // 步骤 3：断言被接受（声明大小在上限内且与响应一致）
      expect(visible).toContain("Matrix attachment");
    } finally {
      store.close();
      vi.unstubAllGlobals();
      await rm(stagingRoot, { recursive: true, force: true });
    }
  });

});
