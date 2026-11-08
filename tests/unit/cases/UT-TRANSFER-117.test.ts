/**
 * Case ID: UT-TRANSFER-117  ·  STATUS: real
 *
 * 责任：分支 L135 if : if (binary === "ssh" && this.config.transf（transfer.ts）
 * 维度坐标：`sshBaseArgs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-117.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-117 · sshBaseArgs · 状态分支 × 合法迁移", () => {
  it("adds the ssh port only for the ssh binary", async () => {
    // 步骤 1：构造 Transfer 与一个带密钥的环境
    process.env.PIKO_UT_SCP_KEY = "PRIVATE-KEY-MATERIAL";
    const transfer = new Transfer(config());
    try {
      // 步骤 2：调用 sshCommandArgs（ssh 路径）
      const args = await transfer.sshCommandArgs("h1", ["echo"]);

      // 步骤 3：断言端口被加上
      expect(args).toContain("-p");
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
    }
  });

});
