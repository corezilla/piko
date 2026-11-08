/**
 * Case ID: UT-TRANSFER-093  ·  STATUS: real
 *
 * 责任：分支 L173 && : error && exitCode === null（remote-exec.ts）
 * 维度坐标：`execRemote` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-093.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-093 · execRemote · 状态分支 × 合法迁移", () => {
  it("rejects an error without an exit code even when not timed out", async () => {
    // 步骤 1：构造 transfer 与一个报错无码的 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ error: new Error("broken pipe") });

    // 步骤 2：调用 execRemote
    // 步骤 3：断言被拒
    await expect(
      execRemote({ host: "h1", argv: ["echo"] }, transfer as never, config(), spawn as never),
    ).rejects.toThrow(/remote execution failed/);
  });

});
