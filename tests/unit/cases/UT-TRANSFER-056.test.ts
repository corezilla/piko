/**
 * Case ID: UT-TRANSFER-056  ·  STATUS: real
 *
 * 责任：参数 `transfer` 的 `空` 类（remote-exec.ts:92）
 * 维度坐标：`execRemote` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-056.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-056 · execRemote · 字符串/路径/枚举输入 × 空", () => {
  it("rejects when the transfer cannot build ssh arguments", async () => {
    // 步骤 1：构造一个没有 sshCommandArgs 的 transfer
    const transfer = { } as never;
    const { spawn } = fakeSpawn();

    // 步骤 2：调用 execRemote
    // 步骤 3：断言被拒（没有凭据骨架就不能出网）
    await expect(
      execRemote({ host: "h1", argv: ["echo"] }, transfer, config(), spawn as never),
    ).rejects.toThrow();
  });

});
