/**
 * Case ID: UT-TRANSFER-148  ·  STATUS: real
 *
 * 责任：分支 L152 `this.config.transfer.retry ?? { max_attempts:…`（??；transfer.ts）
 * 维度坐标：`withRetry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-148.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-148 · withRetry · 状态分支 × 合法迁移", () => {
  it("falls back to the default retry policy when none is configured", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const noRetry = config({ transfer: { staging_root: staging, retry: undefined } });
    const { spawn, calls } = fakeScp([{ error: new Error("boom") }]);
    const transfer = new Transfer(noRetry, spawn as never);
    try {
      // 步骤 2：调用 fetchInputs（无 retry 配置 → 用默认 { max_attempts: 3 }）
      const result = await transfer.fetchInputs("t-1", [{ source: "/remote/allowed", dest: "a.txt" }]);

      // 步骤 3：断言默认尝试次数是 3
      expect(calls).toHaveLength(3);
      expect(result.state).toBe("failed");
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
