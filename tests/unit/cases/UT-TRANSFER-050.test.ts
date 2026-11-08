/**
 * Case ID: UT-TRANSFER-050  ·  STATUS: real
 *
 * 责任：参数 `value` 的 `注入字符` 类（remote-exec.ts:208）
 * 维度坐标：`truncate` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-050.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-050 · truncate · 字符串/路径/枚举输入 × 注入字符", () => {
  it("keeps an injected stdout as data", async () => {
    // 步骤 1：构造含注入串的输出
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ stdout: "$(rm -rf /)`; DROP TABLE x;--" });

    // 步骤 2：调用 execRemote
    const result = await execRemote({ host: "h", argv: ["echo"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言原样保留（不解释）
    expect(result.stdout).toBe("$(rm -rf /)`; DROP TABLE x;--");
  });

});
