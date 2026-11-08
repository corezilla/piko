/**
 * Case ID: UT-TRANSFER-085  ·  STATUS: real
 *
 * 责任：分支 L152 if : if (typeof code === "string" && /^\d+$/.test(code)（remote-exec.ts）
 * 维度坐标：`execRemote` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-085.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-085 · execRemote · 状态分支 × 合法迁移", () => {
  it("rejects a non-numeric string exit code", async () => {
    // 步骤 1：构造 transfer 与一个报非数字字符串码的 spawn 替身
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ error: Object.assign(new Error("weird"), { code: "not-a-number" }) });

    // 步骤 2：调用 execRemote
    // 步骤 3：断言被拒（编不出退出码就不报）
    await expect(
      execRemote({ host: "h1", argv: ["echo"] }, transfer as never, config(), spawn as never),
    ).rejects.toThrow(/remote execution failed/);
  });

});
