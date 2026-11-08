/**
 * Case ID: UT-TRANSFER-288  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1：被调方 `this.sshBaseArgs("scp"` 拒绝必须 typed 化上抛（transfer.ts:94）
 * 维度坐标：`scpArgs` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-288.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-288 · scpArgs · 错误路径 × 每个 typed 错误码", () => {
  it("propagates the missing-known_hosts error from sshBaseArgs", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const noKnownHosts = config({ transfer: { staging_root: staging, known_hosts: undefined } });
    const { spawn, calls } = fakeScp([{ error: null, stdout: "", stderr: "" }]);
    const transfer = new Transfer(noKnownHosts, spawn as never);
    try {
      // 步骤 2：调用 fetchInputs（走 scpArgs → sshBaseArgs 拒绝）
      const result = await transfer.fetchInputs("t-1", [{ source: "/remote/allowed", dest: "a.txt" }]);

      // 步骤 3：断言错误逐值对账——known_hosts 缺失即 fail closed
      expect(result.failed[0].error).toContain("known_hosts is required");
      expect(calls).toHaveLength(0);
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
