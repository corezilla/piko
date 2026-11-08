/**
 * Case ID: UT-TRANSFER-063  ·  STATUS: real
 *
 * 责任：参数 `spawn` 的 `边界(上/下/零/空/满)` 类（remote-exec.ts:92）
 * 维度坐标：`execRemote` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-063.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-063 · execRemote · 纯函数/无副作用 × 每等价类合法值", () => {
  it("passes the output buffer bound to the spawn", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn, spawned } = fakeSpawn({ stdout: "" });

    // 步骤 2：调用 execRemote
    await execRemote({ host: "h1", argv: ["echo"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言 maxBuffer 是输出上限的两倍
    expect((spawned[0].options as { maxBuffer: number }).maxBuffer).toBe(2 * 1024 * 1024);
  });

});
