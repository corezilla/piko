/**
 * Case ID: UT-TRANSFER-122  ·  STATUS: real
 *
 * 责任：参数 `host: string` 的 `空` 类（transfer.ts:145）
 * 维度坐标：`sshCommandArgs` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-122.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-122 · sshCommandArgs · 字符串/路径/枚举输入 × 空", () => {
  it("builds arguments for an empty host", async () => {
    // 步骤 1：构造 Transfer 与一个带密钥的环境
    process.env.PIKO_UT_SCP_KEY = "PRIVATE-KEY-MATERIAL";
    const transfer = new Transfer(config());
    try {
      // 步骤 2：调用 sshCommandArgs("", ["echo"])
      const args = await transfer.sshCommandArgs("", ["echo"]);

      // 步骤 3：断言空主机原样进入 argv（该参数无校验）
      expect(args.slice(-3)).toEqual(["--", "", "echo"]);
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
    }
  });

});
