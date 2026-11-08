/**
 * Case ID: UT-TRANSFER-041  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1：被调方 `execRemote(` 拒绝必须 typed 化上抛（remote-exec-tools.ts:114）
 * 维度坐标：`execute` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-041.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-041 · execute · 错误路径 × 每个 typed 错误码", () => {
  it("records a spawn_error fact for a non-policy rejection", async () => {
    const collector = new ExecutionFactCollector();
    const { spawn } = fakeSpawn({ stdout: "ok" });
    const tool = createRemoteBashTool({
      transfer: {
        sshCommandArgs: async () => {
          throw new PikoError("InputFetchFailed", 422, "connect to host: failure");
        },
      },
      config: config(),
      remoteHosts: ["host"],
      executables: ["cat"],
      executionFacts: collector,
      spawn: spawn as never,
    });
    // 步骤 2：调用 execute（传输失败 → 非 ScopeDenied）
    const result = await tool.execute(
      "call-1",
      { host: "host", command: "cat /etc/hostname" } as never,
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    // 步骤 3：断言事实状态是 spawn_error——不是 policy_denied
    expect(collector.list()[0]?.status).toBe("spawn_error");
    expect(collector.list()[0]?.output).toContain("connect to host: failure");
  });

});
