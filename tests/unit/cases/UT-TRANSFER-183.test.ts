/**
 * Case ID: UT-TRANSFER-183  ·  STATUS: real
 *
 * 责任：资源 L193 clearStaging（transfer.ts）
 * 维度坐标：`fetchInputs` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-183.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-183 · fetchInputs · 资源获取/释放 × 获取失败路径", () => {
  it("clears the staging directory of a task on request", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：先造一个任务目录
      const { mkdir } = await import("node:fs/promises");
      await mkdir(`${staging}/t-1`, { recursive: true });

      // 步骤 2：调用 clearStaging("t-1")
      transfer.clearStaging("t-1");

      // 步骤 3：断言目录被清掉
      const { stat } = await import("node:fs/promises");
      await expect(stat(`${staging}/t-1`)).rejects.toThrow();
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
