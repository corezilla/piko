/**
 * Case ID: UT-TRANSFER-069  ·  STATUS: real
 *
 * 责任：分支 L108 && : allowedHosts.length > 0 && !allowedHosts.incl（remote-exec.ts）
 * 维度坐标：`execRemote` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-069.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-069 · execRemote · 状态分支 × 合法迁移", () => {
  it("allows a host inside the allowlist", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ stdout: "ok" });

    // 步骤 2：调用 execRemote（host 在允许表内）
    const result = await execRemote(
      { host: "h1", argv: ["echo"], remoteHosts: ["h1", "h2"] },
      transfer as never,
      config(),
      spawn as never,
    );

    // 步骤 3：断言成功
    expect(result.exit_code).toBe(0);
  });

});
