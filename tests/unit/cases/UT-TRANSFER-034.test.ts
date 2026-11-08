/**
 * Case ID: UT-TRANSFER-034  ·  STATUS: real
 *
 * 责任：分支 L151 `? result.timed_out :`（ternary；remote-exec-tools.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-034.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-034 · execute · 状态分支 × 合法迁移", () => {
  it("records a timeout fact when the remote command timed out", async () => {
    const { spawn } = fakeSpawn({ error: Object.assign(new Error("killed"), { killed: true }) });    const collector = new ExecutionFactCollector();
    const tool = createRemoteBashTool({
      transfer: fakeTransfer(),
      config: config(),
      remoteHosts: ["host"],
      executables: ["cat"],
      executionFacts: collector,
      spawn: spawn as never,
    });
    // 步骤 2：调用 execute（远端超时）
    const result = await tool.execute(
      "call-1",
      { host: "host", command: "cat /etc/hostname" } as never,
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    // 步骤 3：断言事实状态是 timeout——timed_out 为真时走第一分支
    expect(collector.list()[0]?.status).toBe("timeout");
    expect(collector.list()[0]?.timed_out).toBe(true);
  });

});
