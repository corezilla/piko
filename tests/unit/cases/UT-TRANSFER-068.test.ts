/**
 * Case ID: UT-TRANSFER-068  ·  STATUS: real
 *
 * 责任：分支 L108 if : if (allowedHosts.length > 0 && !allowedHosts.incl（remote-exec.ts）
 * 维度坐标：`execRemote` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-068.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-068 · execRemote · 状态分支 × 合法迁移", () => {
  it("refuses a host outside the allowlist", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn();

    // 步骤 2：调用 execRemote（host 不在允许表内）
    // 步骤 3：断言被拒并逐值指出允许表
    await expect(
      execRemote(
        { host: "evil.example", argv: ["echo"], remoteHosts: ["h1"] },
        transfer as never,
        config(),
        spawn as never,
      ),
    ).rejects.toThrow(/remote host not allowed: evil.example/);
  });

});
