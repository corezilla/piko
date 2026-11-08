/**
 * Case ID: UT-TRANSFER-114  ·  STATUS: real
 *
 * 责任：参数 `binary` 的 `非法值` 类（transfer.ts:112）
 * 维度坐标：`sshBaseArgs` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-114.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-114 · sshBaseArgs · 纯函数/无副作用 × 每等价类合法值", () => {
  it("never passes -B or -q to ssh", async () => {
    // 步骤 1：构造 Transfer 与一个带密钥的环境
    process.env.PIKO_UT_SCP_KEY = "PRIVATE-KEY-MATERIAL";
    const transfer = new Transfer(config());
    try {
      // 步骤 2：调用 sshCommandArgs
      const args = await transfer.sshCommandArgs("h1", ["echo"]);

      // 步骤 3：断言没有 -B（ssh 里 -B 是 bind_interface，带值）与 -q（静默掉诊断）
      expect(args).not.toContain("-B");
      expect(args).not.toContain("-q");
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
    }
  });

});
