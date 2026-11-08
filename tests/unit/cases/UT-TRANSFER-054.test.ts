/**
 * Case ID: UT-TRANSFER-054  ·  STATUS: real
 *
 * 责任：参数 `options` 的 `边界(上/下/零/空/满)` 类（remote-exec.ts:92）
 * 维度坐标：`execRemote` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-054.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-054 · execRemote · 纯函数/无副作用 × 每等价类合法值", () => {
  it("runs with a one-second timeout", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn, spawned } = fakeSpawn({ stdout: "" });

    // 步骤 2：调用 execRemote（timeoutMs＝1000）
    await execRemote({ host: "h1", argv: ["true"], timeoutMs: 1000 }, transfer as never, config(), spawn as never);

    // 步骤 3：断言超时被传给 spawn（该参数无校验）
    expect((spawned[0].options as { timeoutMs: number }).timeoutMs).toBe(1000);
  });

});
