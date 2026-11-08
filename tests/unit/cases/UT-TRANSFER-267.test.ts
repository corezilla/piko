/**
 * Case ID: UT-TRANSFER-267  ·  STATUS: real
 *
 * 责任：资源 rmSync（transfer.ts:75）
 * 维度坐标：`close` × `资源获取/释放` × `正常释放`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-267.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-267 · close · 资源获取/释放 × 正常释放", () => {
  it("removes the key file so it is not left on disk", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 sshCommandArgs（物化密钥）再 close()
      const args = await transfer.sshCommandArgs("h1", ["echo"]);
      const keyFile = args[args.indexOf("-i") + 1];
      transfer.close();

      // 步骤 3：断言密钥目录里不再有文件
      const entries = await readdir(`${staging}/.keys`).catch(() => [] as string[]);
      expect(entries).toEqual([]);
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
