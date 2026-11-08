/**
 * Case ID: UT-TRANSFER-271  ·  STATUS: real
 *
 * 责任：参数 `target` 的 `注入字符` 类（transfer.ts:87）
 * 维度坐标：`assertAllowed` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-271.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-271 · assertAllowed · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected target as data", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 deliverArtifacts（注入串目标）
      await expect(
        transfer.deliverArtifacts("t-1", ["out.txt"], { method: "scp", target: "$(rm -rf /)" }),
      ).rejects.toThrow(/not allowlisted/);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
