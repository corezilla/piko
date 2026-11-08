/**
 * Case ID: UT-TRANSFER-265  ·  STATUS: real
 *
 * 责任：状态写 L77 → `this.tempKey=undefined`（transfer.ts:75）
 * 维度坐标：`close` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-265.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-265 · close · 状态分支 × 合法迁移", () => {
  it("forgets the key path after closing", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 sshCommandArgs 后 close()
      await transfer.sshCommandArgs("h1", ["echo"]);
      transfer.close();

      // 步骤 3：断言两个引用都被清掉
      expect((transfer as unknown as { tempKey?: string }).tempKey).toBeUndefined();
      expect((transfer as unknown as { keyPath?: string }).keyPath).toBeUndefined();
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
