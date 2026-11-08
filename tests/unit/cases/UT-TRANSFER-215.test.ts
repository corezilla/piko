/**
 * Case ID: UT-TRANSFER-215  ·  STATUS: real
 *
 * 责任：分支 L221 ternary : ? failed.length === 0 :（transfer.ts）
 * 维度坐标：`deliverArtifacts` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-215.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-215 · deliverArtifacts · 状态分支 × 合法迁移", () => {
  it("reports the delivered state when nothing failed", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：造一个存在的产物
      await mkdir(`${staging}/t-1`, { recursive: true });
      await writeFile(`${staging}/t-1/out.txt`, "data", "utf8");

      // 步骤 2：调用 deliverArtifacts
      const result = await transfer.deliverArtifacts(
        "t-1",
        ["out.txt"],
        { method: "mount", target: "/remote/allowed" },
      );

      // 步骤 3：断言状态为 delivered（无失败）
      expect(result.state).toBe("delivered");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
