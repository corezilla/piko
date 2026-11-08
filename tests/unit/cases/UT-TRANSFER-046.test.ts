/**
 * Case ID: UT-TRANSFER-046  ·  STATUS: real
 *
 * 责任：参数 `command` 的 `注入字符` 类（remote-exec-tools.ts:99）
 * 维度坐标：`splitRemoteCommand` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-046.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-046 · splitRemoteCommand · 字符串/路径/枚举输入 × 注入字符", () => {
  it("splits an injected command into plain tokens", () => {
    // 步骤 1：构造含注入形态的命令
    const command = "rm -rf /; echo pwned";

    // 步骤 2：调用 splitRemoteCommand(command)
    // 步骤 3：断言按空白切成 token——不做任何 shell 解释
    expect(splitRemoteCommand(command)).toEqual(["rm", "-rf", "/;", "echo", "pwned"]);
  });

});
