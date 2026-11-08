/**
 * Case ID: UT-TRANSFER-073  ·  STATUS: real
 *
 * 责任：分支 L123 ?? : options.timeoutMs ?? DEFAULT_TIMEOUT_MS（remote-exec.ts）
 * 维度坐标：`execRemote` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-073.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-073 · execRemote · 状态分支 × 合法迁移", () => {
  it("uses the default timeout when none is given", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn, spawned } = fakeSpawn({ stdout: "ok" });

    // 步骤 2：调用 execRemote（不带 timeoutMs）
    await execRemote({ host: "h1", argv: ["echo"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言 spawn 收到了默认超时（一个正数）
    expect((spawned[0].options as { timeoutMs: number }).timeoutMs).toBeGreaterThan(0);
  });

});
