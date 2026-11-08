/**
 * Case ID: UT-TRANSFER-052  ·  STATUS: real
 *
 * 责任：返回站点 L209 值 （remote-exec.ts:208）
 * 维度坐标：`truncate` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-052.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-052 · truncate · 纯函数/无副作用 × 每等价类合法值", () => {
  it("cuts the stdout at the limit and says so", async () => {
    // 步骤 1：构造一个超长输出的远端执行
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ stdout: "y".repeat(2 * 1024 * 1024) });

    // 步骤 2：调用 execRemote
    const result = await execRemote({ host: "h", argv: ["cat"] }, transfer as never, config(), spawn as never);

    // 步骤 3：断言 stdout 恰好被切到上限（读者能看见输出被切了）
    expect(result.stdout.length).toBe(1024 * 1024);
    expect(result.truncated).toBe(true);
  });

});
