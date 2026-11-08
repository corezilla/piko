/**
 * Case ID: UT-TRANSFER-074  ·  STATUS: real
 *
 * 责任：分支 L132 if : if (settled)（remote-exec.ts）
 * 维度坐标：`execRemote` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-074.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-074 · execRemote · 状态分支 × 合法迁移", () => {
  it("settles once even if the callback fires twice", async () => {
    // 步骤 1：构造 transfer 与一个会回调两次的 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ stdout: "first" });

    // 步骤 2：调用 execRemote
    const result = await execRemote({ host: "h1", argv: ["echo"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言结果只取第一次回调（settled 守卫）
    expect(result.stdout).toBe("first");
  });

});
