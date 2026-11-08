/**
 * Case ID: UT-TRANSFER-087  ·  STATUS: real
 *
 * 责任：分支 L161 ?? : stderr ?? ""（remote-exec.ts）
 * 维度坐标：`execRemote` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-087.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-087 · execRemote · 状态分支 × 合法迁移", () => {
  it("reads the ssh diagnostics from stderr", async () => {
    // 步骤 1：构造 transfer 与一个带 ssh 诊断的 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({
      error: Object.assign(new Error("exit 255"), { code: 255 }),
      stderr: "ssh: connect to host h1: Connection refused",
    });

    // 步骤 2：调用 execRemote
    const result = await execRemote({ host: "h1", argv: ["echo"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言 stderr 逐值带回（诊断是区分 ssh 自身失败与远端 255 的唯一依据），
    //         且传输失败不 reject——它是一个结果，不是异常
    expect(result.stderr).toContain("ssh: connect to host");
    expect(result.transport_failed).toBe(true);
    expect(result.exit_code).toBeNull();
  });

});
