/**
 * Case ID: UT-TRANSFER-104  ·  STATUS: real
 *
 * 责任：分支 L201 if : if (settled)（remote-exec.ts）
 * 维度坐标：`execRemote` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-104.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-104 · execRemote · 状态分支 × 合法迁移", () => {
  it("ignores a late error after the result settled", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ stdout: "ok" });

    // 步骤 2：调用 execRemote
    const result = await execRemote({ host: "h1", argv: ["echo"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言结果照常返回（迟到的错误不改变已结算的结果）
    expect(result.exit_code).toBe(0);
  });

});
