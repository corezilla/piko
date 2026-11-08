/**
 * Case ID: UT-TRANSFER-049  ·  STATUS: real
 *
 * 责任：参数 `value` 的 `超长` 类（remote-exec.ts:208）
 * 维度坐标：`truncate` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-049.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-049 · truncate · 字符串/路径/枚举输入 × 超长", () => {
  it("truncates a stdout over the output limit", async () => {
    // 步骤 1：构造一个超长输出的远端执行
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ stdout: "x".repeat(2 * 1024 * 1024) });

    // 步骤 2：调用 execRemote
    const result = await execRemote({ host: "h", argv: ["cat"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言 stdout 被截断且 truncated 标记为真
    expect(result.stdout.length).toBeLessThan(2 * 1024 * 1024);
    expect(result.truncated).toBe(true);
  });

});
