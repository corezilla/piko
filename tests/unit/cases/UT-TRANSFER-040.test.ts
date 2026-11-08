/**
 * Case ID: UT-TRANSFER-040  ·  STATUS: real
 *
 * 责任：分支 L197 `? code === "ScopeDenied" :`（ternary；remote-exec-tools.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-040.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-040 · execute · 状态分支 × 合法迁移", () => {
  it("records a policy_denied fact for a scope denial", async () => {
    const collector = new ExecutionFactCollector();
    const { spawn } = fakeSpawn({ stdout: "ok" });
    const tool = createRemoteBashTool({
      transfer: {
        sshCommandArgs: async () => {
          throw new PikoError("ScopeDenied", 403, "denied by policy");
        },
      },
      config: config(),
      remoteHosts: ["host"],
      executables: ["cat"],
      executionFacts: collector,
      spawn: spawn as never,
    });
    // 步骤 2：调用 execute（ScopeDenied）
    const result = await tool.execute(
      "call-1",
      { host: "host", command: "cat /etc/hostname" } as never,
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    // 步骤 3：断言事实状态是 policy_denied——code 为 ScopeDenied 时走第一分支
    expect(collector.list()[0]?.status).toBe("policy_denied");
  });

});
