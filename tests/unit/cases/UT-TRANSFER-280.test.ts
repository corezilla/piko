/**
 * Case ID: UT-TRANSFER-280  ·  STATUS: real
 *
 * 责任：参数 `local: string` 的 `超长` 类（transfer.ts:94）
 * 维度坐标：`scpArgs` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-280.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-280 · scpArgs · 字符串/路径/枚举输入 × 超长", () => {
  it("passes an over-long local path through to scp", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const { spawn, calls } = fakeScp([{ error: null, stdout: "", stderr: "" }]);    const transfer = new Transfer(cfg, spawn as never);
    try {
      // 步骤 2：调用 fetchInputs（超长 dest）
      const long = "d".repeat(4000);
      await transfer.fetchInputs("t-1", [{ source: "/remote/allowed", dest: long }]);

      // 步骤 3：断言超长本地路径原样进入 argv
      expect(calls).toHaveLength(1);
      expect(calls[0].args).toContain(`${staging}/t-1/${long}`);
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
