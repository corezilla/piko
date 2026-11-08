/**
 * Case ID: UT-TRANSFER-136  ·  STATUS: real
 *
 * 责任：参数 `signal: AbortSignal` 的 `每等价类合法值` 类（transfer.ts:15）
 * 维度坐标：`run` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-136.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-136 · run · 纯函数/无副作用 × 每等价类合法值", () => {
  it("runs with an un-aborted signal", async () => {
    // 步骤 1：构造一个未触发的 AbortController
    const controller = new AbortController();
    // 步骤 2：调用 run("echo", ["hi"], controller.signal)
    // 步骤 3：断言成功——未触发的 signal 不影响执行
    const result = await run("echo", ["hi"], controller.signal);
    expect(result.stdout.trim()).toBe("hi");
  });

});
