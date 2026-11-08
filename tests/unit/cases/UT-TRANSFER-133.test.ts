/**
 * Case ID: UT-TRANSFER-133  ·  STATUS: real
 *
 * 责任：参数 `args: string[]` 的 `空` 类（transfer.ts:15）
 * 维度坐标：`run` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-133.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-133 · run · 字符串/路径/枚举输入 × 空", () => {
  it("runs a command with no arguments", async () => {
    // 步骤 1：构造空参数表
    // 步骤 2：调用 run("echo", [])
    // 步骤 3：断言成功——空参数表是合法的
    const result = await run("echo", []);
    expect(result.stdout.trim()).toBe("");
    expect(result.stderr).toBe("");
  });

});
