/**
 * Case ID: UT-TRANSFER-060  ·  STATUS: real
 *
 * 责任：参数 `config` 的 `边界(上/下/零/空/满)` 类（remote-exec.ts:92）
 * 维度坐标：`execRemote` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-060.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-060 · execRemote · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts a config without a transfer section", async () => {
    // 步骤 1：构造 transfer、spawn 替身与一个没有 transfer 段的 config
    const transfer = fakeTransfer();
    const { spawn } = fakeSpawn({ stdout: "ok" });

    // 步骤 2：调用 execRemote —— 该参数不被 execRemote 读取
    const result = await execRemote(
      { host: "h1", argv: ["echo"] },
      transfer as never,
      { instance_id: "x" } as never,
      spawn as never,
    );

    // 步骤 3：断言成功（config 在这一层不参与判定）
    expect(result.exit_code).toBe(0);
  });

});
