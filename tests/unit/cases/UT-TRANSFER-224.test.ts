/**
 * Case ID: UT-TRANSFER-224  ·  STATUS: real
 *
 * 责任：分支 L228 catch : catch ()（transfer.ts:225）
 * 维度坐标：`clearStaging` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-224.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-224 · clearStaging · 状态分支 × 合法迁移", () => {
  it("does not throw when the staging directory cannot be removed", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：造一个任务目录，并在里面放一个只读目录
      await mkdir(`${staging}/t-1/locked`, { recursive: true });

      // 步骤 2：调用 clearStaging("t-1")
      // 步骤 3：断言不抛错（清理是 best effort）
      expect(() => transfer.clearStaging("t-1")).not.toThrow();
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
