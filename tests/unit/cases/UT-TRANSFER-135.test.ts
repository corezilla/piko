/**
 * Case ID: UT-TRANSFER-135  ·  STATUS: real
 *
 * 责任：参数 `args: string[]` 的 `注入字符` 类（transfer.ts:15）
 * 维度坐标：`run` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-135.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-135 · run · 字符串/路径/枚举输入 × 注入字符", () => {
  it("passes an injected argument as data", async () => {
    // 步骤 1：构造一个带 shell 元字符的参数
    // 步骤 2：调用 run("echo", ["$(rm -rf /)"])
    // 步骤 3：断言逐字回显——不经 shell，故元字符不被解释
    const result = await run("echo", ["$(rm -rf /)"]);
    expect(result.stdout.trim()).toBe("$(rm -rf /)");
  });

});
