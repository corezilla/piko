/**
 * Case ID: UT-TRANSFER-044  ·  STATUS: real
 *
 * 责任：参数 `command: string` 的 `空` 类（remote-exec-tools.ts:99）
 * 维度坐标：`splitRemoteCommand` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-044.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-044 · splitRemoteCommand · 字符串/路径/枚举输入 × 空", () => {
  it("returns no tokens for an empty command", () => {
    // 步骤 1：构造空命令
    // 步骤 2：调用 splitRemoteCommand("")
    // 步骤 3：断言返回空数组（该参数无校验）
    expect(splitRemoteCommand("")).toEqual([]);
  });

});
