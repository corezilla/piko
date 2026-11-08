/**
 * Case ID: UT-TRANSFER-070  ·  STATUS: real
 *
 * 责任：分支 L108 ! : !allowedHosts.includes(host)（remote-exec.ts）
 * 维度坐标：`execRemote` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-070.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-070 · execRemote · 状态分支 × 合法迁移", () => {
  it("allows a host when the allowlist is empty", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ stdout: "ok" });

    // 步骤 2：调用 execRemote（允许表为空 → 第一个条件为假）
    const result = await execRemote({ host: "any-host", argv: ["echo"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言成功（空允许表不拦任何 host）
    expect(result.exit_code).toBe(0);
  });

});
