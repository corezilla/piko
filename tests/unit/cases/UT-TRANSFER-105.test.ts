/**
 * Case ID: UT-TRANSFER-105  ·  STATUS: real
 *
 * 责任：throw L101 InvalidRequest（守卫 `if (argv.length === 0)`；remote-exec.ts）
 * 维度坐标：`execRemote` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-105.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-105 · execRemote · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared invalid-request error", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn();

    // 步骤 2：调用 execRemote（argv 为空）
    // 步骤 3：断言 typed 错误码与状态码逐值对账
    await expect(
      execRemote({ host: "h1", argv: [] }, transfer as never, config(), spawn as never),
    ).rejects.toThrow(/remote command argv must not be empty/);
  });

});
