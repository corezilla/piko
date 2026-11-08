/**
 * Case ID: UT-TRANSFER-286  ·  STATUS: real
 *
 * 责任：分支 L98 `if (direction === "pull")`（if；transfer.ts）
 * 维度坐标：`scpArgs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-286.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-286 · scpArgs · 状态分支 × 合法迁移", () => {
  it("takes the pull ordering when the direction is pull", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const { spawn, calls } = fakeScp([{ error: null, stdout: "", stderr: "" }]);    const transfer = new Transfer(cfg, spawn as never);
    try {
      // 步骤 2：调用 fetchInputs（拉取）
      await transfer.fetchInputs("t-1", [{ source: "/remote/allowed", dest: "a.txt" }]);

      // 步骤 3：断言走的是 pull 分支——远端在前
      expect(calls).toHaveLength(1);
      const args = calls[0].args;
      expect(args[args.indexOf("--") + 1]).toBe("/remote/allowed");
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
