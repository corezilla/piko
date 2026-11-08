/**
 * Case ID: UT-TRANSFER-140  ·  STATUS: real
 *
 * 责任：分支 L18 `if (err)`（if；transfer.ts）
 * 维度坐标：`run` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-140.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-140 · run · 状态分支 × 合法迁移", () => {
  it("rejects when the child exits non-zero", async () => {
    // 步骤 1：调用 run("false", [])（退出码 1）
    // 步骤 2：断言拒绝——err 为真即走 rej 分支
    await expect(run("false", [])).rejects.toThrow();
  });

});
