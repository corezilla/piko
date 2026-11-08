/**
 * Case ID: UT-TRANSFER-128  ·  STATUS: real
 *
 * 责任：await 拒绝传播（sshCommandArgs 的 await 目标拒绝必须 typed 化上抛；transfer.ts:145）
 * 维度坐标：`sshCommandArgs` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-128.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-128 · sshCommandArgs · 错误路径 × 每个 typed 错误码", () => {
  it("rejects when the credential skeleton cannot be built", async () => {
    // 步骤 1：构造一个没有 known_hosts 的 Transfer
    const transfer = new Transfer(config({ transfer: { known_hosts: undefined } }));
    try {
      // 步骤 2：调用 sshCommandArgs
      // 步骤 3：断言拒绝被上抛（凭据不完整就不出网）
      await expect(transfer.sshCommandArgs("h1", ["echo"])).rejects.toThrow(/known_hosts is required/);
    } finally {
      transfer.close();
    }
  });

});
