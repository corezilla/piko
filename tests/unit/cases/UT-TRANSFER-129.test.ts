/**
 * Case ID: UT-TRANSFER-129  ·  STATUS: real
 *
 * 责任：返回站点 L148 值 （transfer.ts:145）
 * 维度坐标：`sshCommandArgs` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-129.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-129 · sshCommandArgs · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the credential skeleton followed by the host and argv", async () => {
    // 步骤 1：构造 Transfer 与一个带密钥的环境
    process.env.PIKO_UT_SCP_KEY = "PRIVATE-KEY-MATERIAL";
    const transfer = new Transfer(config());
    try {
      // 步骤 2：调用 sshCommandArgs
      const args = await transfer.sshCommandArgs("h1", ["echo", "hi"]);

      // 步骤 3：断言整体形状：凭据参数在前，"--" 之后是主机与命令
      expect(args.indexOf("--")).toBeGreaterThan(0);
      expect(args.slice(-3)).toEqual(["h1", "echo", "hi"]);
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
    }
  });

});
