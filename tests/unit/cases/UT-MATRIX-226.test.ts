/**
 * Case ID: UT-MATRIX-226  ·  STATUS: real
 *
 * 责任：返回站点 L99 值 （matrix.ts:91）
 * 维度坐标：`downloadMedia` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-226.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-226 · downloadMedia · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the visible attachment note", async () => {
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

      // 步骤 2：调用 downloadMedia
      const visible = await (
        matrix as unknown as { downloadMedia(r: string, e: string, c: unknown): Promise<string> }
      ).downloadMedia("run", "$event", { body: "x.txt", url: "mxc://test/x", info: { size: 4, mimetype: "text/plain" } });

      // 步骤 3：断言返回值是可见的附件说明（含路径、MIME、字节数）
      expect(visible).toContain("Matrix attachment");
      expect(visible).toContain("text/plain");
      expect(visible).toContain("4 bytes");
    } finally {
      store.close();
      vi.unstubAllGlobals();
      await rm(stagingRoot, { recursive: true, force: true });
    }
  });

});
