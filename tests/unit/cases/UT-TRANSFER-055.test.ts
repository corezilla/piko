/**
 * Case ID: UT-TRANSFER-055  ·  STATUS: real
 *
 * 责任：参数 `options` 的 `非法值` 类（remote-exec.ts:92）
 * 维度坐标：`execRemote` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-055.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-055 · execRemote · 纯函数/无副作用 × 每等价类合法值", () => {
  it("refuses an empty argv", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn();

    // 步骤 2：调用 execRemote（argv 为空）
    // 步骤 3：断言被拒（远端命令不得为空）
    await expect(
      execRemote({ host: "h1", argv: [] }, transfer as never, config(), spawn as never),
    ).rejects.toThrow(/argv must not be empty/);
  });

});
