/**
 * Case ID: UT-TRANSFER-088  ·  STATUS: real
 *
 * 责任：分支 L163 && : exitCode === 255 && /(ssh: connect to host（remote-exec.ts）
 * 维度坐标：`execRemote` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-088.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-088 · execRemote · 状态分支 × 合法迁移", () => {
  it("treats an ssh connection failure as a transport failure", async () => {
    // 步骤 1：构造 transfer 与一个报 255 + ssh 诊断的 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({
      error: Object.assign(new Error("exit 255"), { code: 255 }),
      stderr: "ssh: connect to host h1: Connection refused",
    });

    // 步骤 2：调用 execRemote
    const result = await execRemote({ host: "h1", argv: ["echo"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言判为传输失败且退出码被清空（远端命令根本没跑，不是远端退出 255）
    expect(result.transport_failed).toBe(true);
    expect(result.exit_code).toBeNull();
  });

});
