/**
 * Case ID: UT-TRANSFER-126  ·  STATUS: real
 *
 * 责任：参数 `argv` 的 `超长` 类（transfer.ts:145）
 * 维度坐标：`sshCommandArgs` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-126.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-126 · sshCommandArgs · 纯函数/无副作用 × 每等价类合法值", () => {
  it("builds arguments for an over-long argv", async () => {
    // 步骤 1：构造 Transfer 与一个带密钥的环境
    process.env.PIKO_UT_SCP_KEY = "PRIVATE-KEY-MATERIAL";
    const transfer = new Transfer(config());
    try {
      // 步骤 2：调用 sshCommandArgs("h1", [超长命令])
      const argv = ["x".repeat(1000)];
      const args = await transfer.sshCommandArgs("h1", argv);

      // 步骤 3：断言原样进入 argv
      expect(args.slice(-2)).toEqual(["h1", argv[0]]);
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
    }
  });

});
