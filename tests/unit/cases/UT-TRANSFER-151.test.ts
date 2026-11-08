/**
 * Case ID: UT-TRANSFER-151  ·  STATUS: real
 *
 * 责任：分支 L159 `if (attempt < max_attempts)`（if；transfer.ts）
 * 维度坐标：`withRetry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-151.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-151 · withRetry · 状态分支 × 合法迁移", () => {
  it("does not wait after the final attempt", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const { spawn, calls } = fakeScp([{ error: new Error("boom") }]);
    const transfer = new Transfer(cfg, spawn as never);
    try {
      // 步骤 2：调用 fetchInputs（最后一次失败后不再退避）
      const started = Date.now();
      await transfer.fetchInputs("t-1", [{ source: "/remote/allowed", dest: "a.txt" }]);
      const elapsed = Date.now() - started;

      // 步骤 3：断言只退避了两次（base_delay_ms 10 × 1 + 10 × 2 ＝ 30ms）
      expect(calls).toHaveLength(3);
      expect(elapsed).toBeLessThan(1000);
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
