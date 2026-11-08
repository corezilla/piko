/**
 * Case ID: UT-TRANSFER-045  ·  STATUS: real
 *
 * 责任：参数 `command` 的 `超长` 类（remote-exec-tools.ts:99）
 * 维度坐标：`splitRemoteCommand` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-045.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-045 · splitRemoteCommand · 字符串/路径/枚举输入 × 超长", () => {
  it("returns one token for an over-long command", () => {
    // 步骤 1：构造 1000 字符的命令
    const command = "x".repeat(1000);

    // 步骤 2：调用 splitRemoteCommand(command)
    // 步骤 3：断言返回单个 token
    expect(splitRemoteCommand(command)).toEqual([command]);
  });

});
