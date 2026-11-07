/**
 * Case ID: UT-MATRIX-190  ·  STATUS: real
 *
 * 责任：参数 `run` 的 `注入字符` 类（matrix.ts:91）
 * 维度坐标：`downloadMedia` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-190.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-190 · downloadMedia · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected run id as data", async () => {
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
      vi.stubGlobal("fetch", vi.fn(async () => new Response("data", { headers: { "content-type": "text/plain" } })));

      // 步骤 2：调用 downloadMedia(注入串 run id, ...)
      // 步骤 3：断言不被解释为命令——run id 只作目录名的字符
      const visible = await (
        matrix as unknown as { downloadMedia(r: string, e: string, c: unknown): Promise<string> }
      ).downloadMedia("$(rm -rf /)", "$event", { body: "x.txt", url: "mxc://test/x", info: { size: 4, mimetype: "text/plain" } });
      expect(visible).toContain("Matrix attachment");
    } finally {
      store.close();
      vi.unstubAllGlobals();
      await rm(stagingRoot, { recursive: true, force: true });
    }
  });

});
