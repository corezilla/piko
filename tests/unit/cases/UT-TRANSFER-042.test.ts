/**
 * Case ID: UT-TRANSFER-042  ·  STATUS: real
 *
 * 责任：返回站点 L161 值 `{ content: [ { type: "text", text: JSON…` 逐值断言（remote-exec-tools.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-042.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer, textOf } from "./support/transfer-fix.js";

describe("UT-TRANSFER-042 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the remote result as JSON text", async () => {
    const collector = new ExecutionFactCollector();
    const { spawn } = fakeSpawn({ stdout: "out", stderr: "err" });
    const tool = createRemoteBashTool({
      transfer: fakeTransfer(),
      config: config(),
      remoteHosts: ["host"],
      executables: ["cat"],
      executionFacts: collector,
      spawn: spawn as never,
    });
    // 步骤 2：调用 execute
    const result = await tool.execute(
      "call-1",
      { host: "host", command: "cat /etc/hostname" } as never,
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    // 步骤 3：断言返回值逐值对账——content 是 JSON 文本，details 是结构化结果
    expect(result.content[0]?.type).toBe("text");
    const payload = JSON.parse(textOf(result)) as Record<string, unknown>;
    expect(payload.stdout).toBe("out");
    expect(payload.stderr).toBe("err");
    expect(payload.exit_code).toBe(0);
    expect(payload.remote_stop_state).toBe("stopped");
    expect(result.details?.host).toBe("host");
  });

});
