/**
 * Case ID: UT-TRANSFER-121  ·  STATUS: real
 *
 * 责任：返回站点 L136 值 （transfer.ts:112）
 * 维度坐标：`sshBaseArgs` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-121.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-121 · sshBaseArgs · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the argument list with the host and argv appended", async () => {
    // 步骤 1：构造 Transfer 与一个带密钥的环境
    process.env.PIKO_UT_SCP_KEY = "PRIVATE-KEY-MATERIAL";
    const transfer = new Transfer(config());
    try {
      // 步骤 2：调用 sshCommandArgs
      const args = await transfer.sshCommandArgs("h1", ["echo", "hi"]);

      // 步骤 3：断言末尾是 "-- 主机 命令"（"--" 之后的一切都不再被 ssh 解释）
      expect(args.slice(-4)).toEqual(["--", "h1", "echo", "hi"]);
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
    }
  });

});
