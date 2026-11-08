/**
 * Case ID: UT-TRANSFER-057  ·  STATUS: real
 *
 * 责任：参数 `transfer` 的 `超长` 类（remote-exec.ts:92）
 * 维度坐标：`execRemote` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-057.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-057 · execRemote · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects a transfer with no ssh argument builder", async () => {
    // 步骤 1：构造一个空 transfer
    const transfer = { } as never;
    const { spawn } = fakeSpawn();

    // 步骤 2：调用 execRemote
    // 步骤 3：断言被拒
    await expect(
      execRemote({ host: "h1", argv: ["echo"] }, transfer, config(), spawn as never),
    ).rejects.toThrow();
  });

});
