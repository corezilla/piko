/**
 * Case ID: UT-TRANSFER-201  ·  STATUS: real
 *
 * 责任：参数 `baseDir` 的 `注入字符` 类（transfer.ts:198）
 * 维度坐标：`deliverArtifacts` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-201.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-201 · deliverArtifacts · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected base dir as data", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 deliverArtifacts（注入串 baseDir）
      const result = await transfer.deliverArtifacts(
        "t-1",
        ["out.txt"],
        { method: "mount", target: "/remote/allowed" },
        undefined,
        "$(rm -rf /)",
      );

      // 步骤 3：断言失败被记下（未执行任何东西）
      expect(result.state).toBe("failed");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
