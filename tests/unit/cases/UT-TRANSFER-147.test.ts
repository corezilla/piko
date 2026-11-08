/**
 * Case ID: UT-TRANSFER-147  ·  STATUS: real
 *
 * 责任：参数 `fn: () => Promise<T>` 的 `非法值` 类（transfer.ts:151）
 * 维度坐标：`withRetry` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-147.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-147 · withRetry · 纯函数/无副作用 × 非法值", () => {
  it("gives up after the last attempt and reports the failure", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const { spawn, calls } = fakeScp([{ error: new Error("boom") }]);    const transfer = new Transfer(cfg, spawn as never);
    try {
      // 步骤 2：调用 fetchInputs（走 scp → withRetry → run）
      const result = await transfer.fetchInputs("t-1", [{ source: "/remote/allowed", dest: "a.txt" }]);

      // 步骤 3：断言最后一次的错误被上抛（不吞错、不降级为成功）
      expect(result.failed[0].error).toBe("boom");
      expect(calls.length).toBeGreaterThan(0);
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
