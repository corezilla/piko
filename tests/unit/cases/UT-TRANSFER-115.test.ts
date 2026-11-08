/**
 * Case ID: UT-TRANSFER-115  ·  STATUS: real
 *
 * 责任：分支 L114 ! : !knownHosts（transfer.ts）
 * 维度坐标：`sshBaseArgs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-115.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-115 · sshBaseArgs · 状态分支 × 合法迁移", () => {
  it("refuses to build arguments without a known_hosts file", async () => {
    // 步骤 1：构造一个没有 known_hosts 的 Transfer
    const transfer = new Transfer(config({ transfer: { known_hosts: undefined } }));
    try {
      // 步骤 2：调用 sshCommandArgs
      // 步骤 3：断言被拒（主机密钥必须固定，不自动接受）
      await expect(transfer.sshCommandArgs("h1", ["echo"])).rejects.toThrow(/known_hosts is required/);
    } finally {
      transfer.close();
    }
  });

});
