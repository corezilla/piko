/**
 * Case ID: UT-TRANSFER-200  ·  STATUS: real
 *
 * 责任：参数 `baseDir: string` 的 `超长` 类（transfer.ts:198）
 * 维度坐标：`deliverArtifacts` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-200.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-200 · deliverArtifacts · 字符串/路径/枚举输入 × 超长", () => {
  it("reports a failure for an over-long base dir", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 deliverArtifacts（超长 baseDir）
      const result = await transfer.deliverArtifacts(
        "t-1",
        ["out.txt"],
        { method: "mount", target: "/remote/allowed" },
        undefined,
        "b".repeat(4096),
      );

      // 步骤 3：断言失败被记下
      expect(result.state).toBe("failed");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
