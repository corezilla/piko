/**
 * Case ID: UT-TRANSFER-272  ·  STATUS: real
 *
 * 责任：分支 L88 ?? : this.config.transfer.target_allowlist （transfer.ts:87）
 * 维度坐标：`assertAllowed` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-272.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-272 · assertAllowed · 状态分支 × 合法迁移", () => {
  it("treats a missing allowlist as allowing nothing", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const noAllow = config({ transfer: { staging_root: staging, target_allowlist: undefined } });
    const transfer = new Transfer(noAllow);
    try {
      // 步骤 1：在 staging 的任务目录下造一个产物
      await mkdir(`${staging}/t-1`, { recursive: true });
      await writeFile(`${staging}/t-1/out.txt`, "data", "utf8");

      // 步骤 2：调用 deliverArtifacts（无允许表）
      // 步骤 3：断言被拒——空允许表里没有一项能匹配目标（fail closed）
      await expect(
        transfer.deliverArtifacts("t-1", ["out.txt"], { method: "mount", target: "/remote/anything" }),
      ).rejects.toThrow(/not allowlisted/);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
