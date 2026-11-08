/**
 * Case ID: UT-TRANSFER-230  ·  STATUS: real
 *
 * 责任：参数 `rel` 的 `超长` 类（transfer.ts:25）
 * 维度坐标：`safeJoinIn` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-230.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-230 · safeJoinIn · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects an over-long relative path that escapes", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 deliverArtifacts（超长逃逸路径）
      const result = await transfer.deliverArtifacts(
        "t-1",
        ["../" + "x".repeat(1000)],
        { method: "mount", target: "/remote/allowed" },
        undefined,
        staging,
      );

      // 步骤 3：断言失败被记下（路径逃逸被拒）
      expect(result.state).toBe("failed");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
