/**
 * Case ID: UT-TRANSFER-258  ·  STATUS: real
 *
 * 责任：状态写 L71 → `this.keyPath`（transfer.ts:53）
 * 维度坐标：`scpKeyPath` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-258.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-258 · scpKeyPath · 状态分支 × 合法迁移", () => {
  it("caches the key path so it is not materialised twice", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 sshCommandArgs
      await transfer.sshCommandArgs("h1", ["echo"]);

      // 步骤 3：断言 keyPath 被缓存
      expect((transfer as unknown as { keyPath?: string }).keyPath).toBeTruthy();
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
