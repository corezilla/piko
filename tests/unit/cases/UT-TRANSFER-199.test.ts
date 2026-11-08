/**
 * Case ID: UT-TRANSFER-199  ·  STATUS: real
 *
 * 责任：参数 `baseDir: string` 的 `空` 类（transfer.ts:198）
 * 维度坐标：`deliverArtifacts` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-199.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-199 · deliverArtifacts · 字符串/路径/枚举输入 × 空", () => {
  it("reads from the base dir when one is given", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：在 baseDir 下造一个产物
      await mkdir(`${staging}/work`, { recursive: true });
      await writeFile(`${staging}/work/out.txt`, "data", "utf8");

      // 步骤 2：调用 deliverArtifacts（带 baseDir）
      const result = await transfer.deliverArtifacts(
        "t-1",
        ["out.txt"],
        { method: "mount", target: "/remote/allowed" },
        undefined,
        `${staging}/work`,
      );

      // 步骤 3：断言产物被读到（mount 方式直写，不做传输）
      expect(result.delivered).toHaveLength(1);
      expect(result.delivered[0].path).toBe("out.txt");
      expect(result.delivered[0].size_bytes).toBe(4);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
