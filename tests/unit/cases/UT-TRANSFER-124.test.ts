/**
 * Case ID: UT-TRANSFER-124  ·  STATUS: real
 *
 * 责任：参数 `host` 的 `注入字符` 类（transfer.ts:145）
 * 维度坐标：`sshCommandArgs` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-124.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-124 · sshCommandArgs · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected host as data", async () => {
    // 步骤 1：构造 Transfer 与一个带密钥的环境
    process.env.PIKO_UT_SCP_KEY = "PRIVATE-KEY-MATERIAL";
    const transfer = new Transfer(config());
    try {
      // 步骤 2：调用 sshCommandArgs(注入串主机, ["echo"])
      const args = await transfer.sshCommandArgs("$(rm -rf /)", ["echo"]);

      // 步骤 3：断言原样进入 argv（"--" 之后 ssh 不再解释）
      expect(args).toContain("$(rm -rf /)");
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
    }
  });

});
