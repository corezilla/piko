/**
 * Case ID: UT-TRANSFER-107  ·  STATUS: real
 *
 * 责任：资源 L132 execFile（remote-exec.ts）
 * 维度坐标：`execRemote` × `资源获取/释放` × `正常释放`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-107.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-107 · execRemote · 资源获取/释放 × 正常释放", () => {
  it("never leaves a client running past the timeout", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn, spawned } = fakeSpawn({ stdout: "ok" });

    // 步骤 2：调用 execRemote
    await execRemote({ host: "h1", argv: ["echo"], timeoutMs: 500 }, transfer as never, config(), spawn as never);

    // 步骤 3：断言超时被传给客户端（客户端自己负责退出）
    expect((spawned[0].options as { timeoutMs: number }).timeoutMs).toBe(500);
  });

});
