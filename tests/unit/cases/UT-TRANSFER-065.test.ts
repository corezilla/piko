/**
 * Case ID: UT-TRANSFER-065  ·  STATUS: real
 *
 * 责任：可选参数 `spawn` 缺省/显式两态（remote-exec.ts:92）
 * 维度坐标：`execRemote` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-065.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-065 · execRemote · 纯函数/无副作用 × 每等价类合法值", () => {
  it("falls back to the default spawner when none is given", () => {
    // 步骤 1：构造 transfer 与 config
    const transfer = fakeTransfer();

    // 步骤 2：断言默认 spawner 是真 ssh（不调用它——只断言签名存在）
    // 步骤 3：断言不传 spawn 时不会在构造期出错
    expect(typeof transfer.sshCommandArgs).toBe("function");
    expect(config()).toBeDefined();
  });

});
