/**
 * Case ID: UT-TRANSFER-137  ·  STATUS: real
 *
 * 责任：参数 `signal: AbortSignal` 的 `边界(上/下/零/空/满)` 类（transfer.ts:15）
 * 维度坐标：`run` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-137.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-137 · run · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("aborts the child when the signal fires", async () => {
    // 步骤 1：构造一个已触发的 AbortController
    const controller = new AbortController();
    controller.abort();
    // 步骤 2：调用 run("echo", ["hi"], controller.signal)
    // 步骤 3：断言被中止——ABORT_ERR 是 Node 的取消错误
    await expect(run("echo", ["hi"], controller.signal)).rejects.toThrow(/abort/i);
  });

});
