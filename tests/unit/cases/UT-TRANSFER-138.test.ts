/**
 * Case ID: UT-TRANSFER-138  ·  STATUS: real
 *
 * 责任：参数 `signal: AbortSignal` 的 `非法值` 类（transfer.ts:15）
 * 维度坐标：`run` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-138.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-138 · run · 纯函数/无副作用 × 非法值", () => {
  it("rejects a signal that is not an AbortSignal", async () => {
    // 步骤 1：构造一个不是 AbortSignal 的对象
    // 步骤 2：调用 run("echo", ["hi"], {} as never)
    // 步骤 3：断言被拒——Node 校验 signal 的类型
    await expect(run("echo", ["hi"], {} as never)).rejects.toThrow(/AbortSignal/);
  });

});
