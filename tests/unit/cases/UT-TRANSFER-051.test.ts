/**
 * Case ID: UT-TRANSFER-051  ·  STATUS: real
 *
 * 责任：分支 L209 ternary : ? value.length > MAX_OUTPUT_BYTES :（remote-exec.ts）
 * 维度坐标：`truncate` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-051.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-051 · truncate · 状态分支 × 合法迁移", () => {
  it("leaves a stdout under the limit untouched", async () => {
    // 步骤 1：构造一个短输出的远端执行
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ stdout: "short output" });

    // 步骤 2：调用 execRemote
    const result = await execRemote({ host: "h", argv: ["echo"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言原样返回（未过上限）
    expect(result.stdout).toBe("short output");
    expect(result.truncated).toBe(false);
  });

});
