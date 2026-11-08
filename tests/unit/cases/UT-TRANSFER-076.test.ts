/**
 * Case ID: UT-TRANSFER-076  ·  STATUS: real
 *
 * 责任：分支 L139 || : killed || (error as { signal?: string } | un（remote-exec.ts）
 * 维度坐标：`execRemote` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-076.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-076 · execRemote · 状态分支 × 合法迁移", () => {
  it("treats a SIGTERM client as timed out", async () => {
    // 步骤 1：构造 transfer 与一个带 signal 的 spawn 替身
    const transfer = fakeTransfer();
    const killed = Object.assign(new Error("terminated"), { signal: "SIGTERM" });
    const { spawn } = fakeSpawn({ error: killed });

    // 步骤 2：调用 execRemote
    const result = await execRemote({ host: "h1", argv: ["sleep 100"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言判为超时
    expect(result.timed_out).toBe(true);
  });

});
