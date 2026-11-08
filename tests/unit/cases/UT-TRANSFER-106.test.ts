/**
 * Case ID: UT-TRANSFER-106  ·  STATUS: real
 *
 * 责任：throw L109 ScopeDenied（守卫 `if (allowedHosts.length > 0 && ...`；remote-exec.ts）
 * 维度坐标：`execRemote` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-106.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-106 · execRemote · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared scope-denied error", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn();

    // 步骤 2：调用 execRemote（host 不在允许表内）
    // 步骤 3：断言 typed 错误码与状态码逐值对账
    await expect(
      execRemote(
        { host: "evil.example", argv: ["echo"], remoteHosts: ["h1"] },
        transfer as never,
        config(),
        spawn as never,
      ),
    ).rejects.toThrow(/remote host not allowed/);
  });

});
