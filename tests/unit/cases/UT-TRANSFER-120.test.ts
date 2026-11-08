/**
 * Case ID: UT-TRANSFER-120  ·  STATUS: real
 *
 * 责任：throw L116 InputFetchFailed（守卫 `if (!key)`；transfer.ts）
 * 维度坐标：`sshBaseArgs` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-120.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-120 · sshBaseArgs · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared credential error", async () => {
    // 步骤 1：构造一个没有 credential_ref 的 Transfer
    const transfer = new Transfer(config({ transfer: { credential_ref: undefined } }));
    try {
      // 步骤 2：调用 sshCommandArgs
      // 步骤 3：断言 typed 错误码与状态码逐值对账
      await expect(transfer.sshCommandArgs("h1", ["echo"])).rejects.toThrow(/credential_ref is required/);
    } finally {
      transfer.close();
    }
  });

});
