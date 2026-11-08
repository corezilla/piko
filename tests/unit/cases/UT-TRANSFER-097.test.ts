/**
 * Case ID: UT-TRANSFER-097  ·  STATUS: real
 *
 * 责任：分支 L188 ?? : stderr ?? ""（remote-exec.ts）
 * 维度坐标：`execRemote` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-097.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-097 · execRemote · 状态分支 × 合法迁移", () => {
  it("returns an empty stderr when there is none", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ stdout: "ok", stderr: "" });

    // 步骤 2：调用 execRemote
    const result = await execRemote({ host: "h1", argv: ["true"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言 stderr 为空串
    expect(result.stderr).toBe("");
  });

});
