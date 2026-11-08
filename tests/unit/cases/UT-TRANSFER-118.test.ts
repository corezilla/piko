/**
 * Case ID: UT-TRANSFER-118  ·  STATUS: real
 *
 * 责任：分支 L135 && : binary === "ssh" && this.config.transfer.p（transfer.ts）
 * 维度坐标：`sshBaseArgs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-118.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-118 · sshBaseArgs · 状态分支 × 合法迁移", () => {
  it("omits the port when none is configured", async () => {
    // 步骤 1：构造 Transfer（无端口）与一个带密钥的环境
    process.env.PIKO_UT_SCP_KEY = "PRIVATE-KEY-MATERIAL";
    const transfer = new Transfer(config({ transfer: { port: undefined } }));
    try {
      // 步骤 2：调用 sshCommandArgs
      const args = await transfer.sshCommandArgs("h1", ["echo"]);

      // 步骤 3：断言没有端口参数
      expect(args).not.toContain("-p");
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
    }
  });

});
