/**
 * Case ID: UT-TRANSFER-251  ·  STATUS: real
 *
 * 责任：分支 L55 ! : !ref（transfer.ts:53）
 * 维度坐标：`scpKeyPath` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-251.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-251 · scpKeyPath · 状态分支 × 合法迁移", () => {
  it("materialises the key when a credential reference exists", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "PRIVATE-KEY-MATERIAL";
    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 sshCommandArgs
      const args = await transfer.sshCommandArgs("h1", ["echo"]);

      // 步骤 3：断言私钥被物化成一个文件并传给 ssh（-i 指向它）
      const keyIndex = args.indexOf("-i");
      expect(keyIndex).toBeGreaterThan(0);
      expect(args[keyIndex + 1]).toContain(".keys");
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
