/**
 * Case ID: UT-TRANSFER-108  ·  STATUS: real
 *
 * 责任：返回站点 L126 值 （remote-exec.ts）
 * 维度坐标：`execRemote` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-108.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-108 · execRemote · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the result of a successful remote command", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ stdout: "hello" });

    // 步骤 2：调用 execRemote
    const result = await execRemote({ host: "h1", argv: ["echo", "hello"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言结果字段逐值对账
    expect(result.exit_code).toBe(0);
    expect(result.stdout).toBe("hello");
    expect(result.truncated).toBe(false);
    expect(result.transport_failed).toBe(false);
  });

});
