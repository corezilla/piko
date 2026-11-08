/**
 * Case ID: UT-TRANSFER-084  ·  STATUS: real
 *
 * 责任：分支 L152 else : if (typeof code === "string" && /^\d+$/.te（remote-exec.ts）
 * 维度坐标：`execRemote` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-084.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-084 · execRemote · 状态分支 × 合法迁移", () => {
  it("takes a numeric string exit code as a number", async () => {
    // 步骤 1：构造 transfer 与一个报数字字符串码的 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ error: Object.assign(new Error("exit 9"), { code: "9" }) });

    // 步骤 2：调用 execRemote
    const result = await execRemote({ host: "h1", argv: ["false"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言字符串码被转成数字
    expect(result.exit_code).toBe(9);
  });

});
