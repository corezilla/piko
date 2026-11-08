/**
 * Case ID: UT-TRANSFER-048  ·  STATUS: real
 *
 * 责任：参数 `value: string` 的 `空` 类（remote-exec.ts:208）
 * 维度坐标：`truncate` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-048.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-048 · truncate · 字符串/路径/枚举输入 × 空", () => {
  it("returns an empty stdout unchanged", async () => {
    // 步骤 1：构造一个输出为空的远端执行
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ stdout: "" });

    // 步骤 2：调用 execRemote
    const result = await execRemote({ host: "h", argv: ["echo"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言 stdout 原样为空
    expect(result.stdout).toBe("");
    expect(result.truncated).toBe(false);
  });

});
