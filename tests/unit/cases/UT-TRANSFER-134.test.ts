/**
 * Case ID: UT-TRANSFER-134  ·  STATUS: real
 *
 * 责任：参数 `args: string[]` 的 `超长` 类（transfer.ts:15）
 * 维度坐标：`run` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-134.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-134 · run · 字符串/路径/枚举输入 × 超长", () => {
  it("passes an over-long argument through to the process", async () => {
    // 步骤 1：构造一个 100000 字符的参数
    // 步骤 2：调用 run("echo", [超长])
    // 步骤 3：断言成功——参数进了 argv（execFile 不做长度校验）
    const result = await run("echo", ["y".repeat(100000)]);
    expect(result.stdout.trim()).toHaveLength(100000);
  });

});
