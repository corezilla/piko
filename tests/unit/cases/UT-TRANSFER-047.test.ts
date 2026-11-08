/**
 * Case ID: UT-TRANSFER-047  ·  STATUS: real
 *
 * 责任：返回站点 L100 值 （remote-exec-tools.ts:99）
 * 维度坐标：`splitRemoteCommand` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-047.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-047 · splitRemoteCommand · 纯函数/无副作用 × 每等价类合法值", () => {
  it("splits a command on whitespace", () => {
    // 步骤 1：构造一条多参数的命令
    const command = "  git   log --oneline  ";

    // 步骤 2：调用 splitRemoteCommand(command)
    // 步骤 3：断言按空白切开、空段被丢弃
    expect(splitRemoteCommand(command)).toEqual(["git", "log", "--oneline"]);
  });

});
