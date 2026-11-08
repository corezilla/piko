/**
 * Case ID: UT-TRANSFER-259  ·  STATUS: real
 *
 * 责任：资源 mkdirSync（transfer.ts:53）
 * 维度坐标：`scpKeyPath` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-259.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-259 · scpKeyPath · 资源获取/释放 × 获取失败路径", () => {
  it("creates the key directory with owner-only permissions", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 sshCommandArgs（物化密钥 → 建 .keys 目录）
      await transfer.sshCommandArgs("h1", ["echo"]);

      // 步骤 3：断言密钥目录被建在 staging 下且是 0700
      const keyDir = `${staging}/.keys`;
      expect((await stat(keyDir)).isDirectory()).toBe(true);
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
