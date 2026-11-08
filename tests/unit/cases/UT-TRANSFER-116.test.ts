/**
 * Case ID: UT-TRANSFER-116  ·  STATUS: real
 *
 * 责任：分支 L116 ! : !key（transfer.ts）
 * 维度坐标：`sshBaseArgs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-116.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-116 · sshBaseArgs · 状态分支 × 合法迁移", () => {
  it("refuses to build arguments without a private key", async () => {
    // 步骤 1：构造一个没有 credential_ref 的 Transfer
    const transfer = new Transfer(config({ transfer: { credential_ref: undefined } }));
    try {
      // 步骤 2：调用 sshCommandArgs
      // 步骤 3：断言被拒（不回退 ~/.ssh，也不弹密码提示）
      await expect(transfer.sshCommandArgs("h1", ["echo"])).rejects.toThrow(/credential_ref is required/);
    } finally {
      transfer.close();
    }
  });

});
