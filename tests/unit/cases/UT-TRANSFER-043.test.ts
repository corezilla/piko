/**
 * Case ID: UT-TRANSFER-043  ·  STATUS: real
 *
 * 责任：返回站点 L201 值 `{ content: [{ type: "text", text: `remo…` 逐值断言（remote-exec-tools.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-043.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer, textOf } from "./support/transfer-fix.js";

describe("UT-TRANSFER-043 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the unavailable result when the remote call fails", async () => {
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
    // 步骤 2：调用 execute（传输失败）
    const result = await tool.execute(
      "call-1",
      { host: "host", command: "cat /etc/hostname" } as never,
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    // 步骤 3：断言返回值逐值对账——失败形态的内容与 details
    expect(textOf(result)).toBe(
      "remote execution unavailable: InputFetchFailed: connect to host: failure",
    );
    expect(result.details).toEqual({
      host: "host",
      exit_code: null,
      timed_out: false,
      truncated: false,
      remote_stop_state: "unknown",
      duration_ms: 0,
      error: "InputFetchFailed",
    });
  });

});
