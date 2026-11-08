/**
 * Case ID: UT-TRANSFER-222  ·  STATUS: real
 *
 * 责任：参数 `taskId` 的 `超长` 类（transfer.ts:225）
 * 维度坐标：`clearStaging` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-222.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-222 · clearStaging · 字符串/路径/枚举输入 × 超长", () => {
  it("clears nothing for an over-long task id", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：造一个任务目录
      await mkdir(`${staging}/t-1`, { recursive: true });

      // 步骤 2：调用 clearStaging(超长 id)
      transfer.clearStaging("t".repeat(1000));

      // 步骤 3：断言原目录还在（超长 id 指向不到任何东西）
      expect((await stat(`${staging}/t-1`)).isDirectory()).toBe(true);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
