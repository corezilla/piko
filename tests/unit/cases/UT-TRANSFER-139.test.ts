/**
 * Case ID: UT-TRANSFER-139  ·  STATUS: real
 *
 * 责任：可选参数 `signal` 缺省/显式两态（transfer.ts:15）
 * 维度坐标：`run` × `字符串/路径/枚举输入` × `未知枚举`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-139.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-139 · run · 字符串/路径/枚举输入 × 未知枚举", () => {
  it("runs the same with and without a signal", async () => {
    // 步骤 1：不传 signal 跑一次
    const withoutSignal = await run("echo", ["hi"]);
    // 步骤 2：传一个显式未触发的 signal 再跑一次
    const controller = new AbortController();
    const withSignal = await run("echo", ["hi"], controller.signal);
    // 步骤 3：断言两态同构——缺省与显式默认值结果一致
    expect(withSignal.stdout).toBe(withoutSignal.stdout);
  });

});
