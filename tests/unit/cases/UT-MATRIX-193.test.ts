/**
 * Case ID: UT-MATRIX-193  ·  STATUS: real
 *
 * 责任：参数 `event` 的 `注入字符` 类（matrix.ts:91）
 * 维度坐标：`downloadMedia` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-193.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-193 · downloadMedia · 字符串/路径/枚举输入 × 注入字符", () => {
  it("sanitises an injected event id into the file name", async () => {
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

      // 步骤 2：调用 downloadMedia("run", 注入串事件 id, ...)
      const visible = await (
        matrix as unknown as { downloadMedia(r: string, e: string, c: unknown): Promise<string> }
      ).downloadMedia(
        "run",
        "$(rm -rf /)",
        { body: "x.txt", url: "mxc://test/x", info: { size: 4, mimetype: "text/plain" } },
      );

      // 步骤 3：断言文件名里的注入串被消毒（只留安全字符）
      expect(visible).not.toContain("$(rm -rf /)");
      expect(visible).toContain("attachment");
    } finally {
      store.close();
      vi.unstubAllGlobals();
      await rm(stagingRoot, { recursive: true, force: true });
    }
  });

});
