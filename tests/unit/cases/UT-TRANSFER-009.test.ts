/**
 * Case ID: UT-TRANSFER-009  ·  STATUS: real
 *
 * 责任：被测符号 `execRemote`（TRANSFER）在对象类型 `字符串/路径/枚举输入` 下的维度格 `超长`（该 Case 只登记本行 1 格）、`空`、`注入字符`、`未知枚举`、`路径穿越`；`execRemote` × `字符串/路径/枚举输入` 格 `超长`（波次一：补齐 §2.3 未登记格；remote-exec.ts:92，分支 39 点）；只测该符号该类型
 * 维度坐标：`execRemote` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-009.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { DurableNodeExecutionEnv } from "../../../src/durable-fs.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-009 · execRemote · 字符串/路径/枚举输入 × 超长", () => {
  it("passes an over-long host name to the SSH skeleton", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn, spawned } = fakeSpawn({ stdout: "done" });

    // 步骤 2：调用 execRemote（超长主机名）
    const result = await execRemote(
      { host: "h".repeat(1000), argv: ["echo", "hi"] },
      transfer as never,
      config(),
      spawn as never,
    );

    // 步骤 3：断言超长主机名原样进入 argv——不被截断也不被拒
    expect(result.exit_code).toBe(0);
    expect(spawned).toHaveLength(1);
    expect(spawned[0]?.args).toContain("h".repeat(1000));
  });

});
