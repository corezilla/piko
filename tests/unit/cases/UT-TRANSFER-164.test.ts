/**
 * Case ID: UT-TRANSFER-164  ·  STATUS: real
 *
 * 责任：可选参数 `signal` 缺省/显式两态（transfer.ts:166）
 * 维度坐标：`fetchInputs` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-164.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-164 · fetchInputs · 纯函数/无副作用 × 每等价类合法值", () => {
  it("works with and without a signal", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：缺省 signal
      const without = await transfer.fetchInputs("t-1", []);
      // 步骤 2：显式 signal
      const controller = new AbortController();
      const with_ = await transfer.fetchInputs("t-2", [], controller.signal);

      // 步骤 3：断言两者都正常返回
      expect(without.state).toBe("none");
      expect(with_.state).toBe("none");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
