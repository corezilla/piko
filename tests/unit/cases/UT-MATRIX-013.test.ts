/**
 * Case ID: UT-MATRIX-013  ·  STATUS: real
 *
 * 责任：`downloadMedia` × `字符串/路径/枚举输入` × `未知枚举`（波次一粗粒度登记）
 * 维度坐标：`downloadMedia` × `字符串/路径/枚举输入` × `未知枚举`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-013.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-013 · downloadMedia · 字符串/路径/枚举输入 × 未知枚举", () => {
  it("accepts a media whose url carries an unknown scheme marker", async () => {
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

      // 步骤 2：调用 downloadMedia（mxc URL 带未知后缀）
      const visible = await (
        matrix as unknown as { downloadMedia(r: string, e: string, c: unknown): Promise<string> }
      ).downloadMedia("run", "$event", { body: "x.txt", url: "mxc://test/x?extra=1", info: { size: 4, mimetype: "text/plain" } });

      // 步骤 3：断言被接受（URL 仍以 mxc:// 开头即为合法）
      expect(visible).toContain("Matrix attachment");
    } finally {
      store.close();
      vi.unstubAllGlobals();
      await rm(stagingRoot, { recursive: true, force: true });
    }
  });

});
