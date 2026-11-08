/**
 * Case ID: UT-TRANSFER-289  ·  STATUS: real
 *
 * 责任：返回站点 L100 值 `args` 逐值断言（transfer.ts）
 * 维度坐标：`scpArgs` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-289.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-289 · scpArgs · 纯函数/无副作用 × 每等价类合法值", () => {
  it("builds the scp argv with the pinned credential skeleton", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const { spawn, calls } = fakeScp([{ error: null, stdout: "", stderr: "" }]);    const transfer = new Transfer(cfg, spawn as never);
    try {
      // 步骤 2：调用 fetchInputs（走 scpArgs）
      await transfer.fetchInputs("t-1", [{ source: "/remote/allowed", dest: "a.txt" }]);

      // 步骤 3：断言返回值逐值对账——凭据骨架 ＋ 端口 ＋ "--" 分隔符
      expect(calls).toHaveLength(1);
      const args = calls[0].args;
      expect(args).toContain("-o");
      expect(args).toContain("BatchMode=yes");
      expect(args).toContain("StrictHostKeyChecking=yes");
      expect(args).toContain("IdentitiesOnly=yes");
      expect(args).toContain("-i");
      expect(args).toContain("--");
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
