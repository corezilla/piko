/**
 * Case ID: UT-TRANSFER-012  ·  STATUS: real
 *
 * 责任：参数 `deps: RemoteExecToolDeps` 的 `非法值` 类（remote-exec-tools.ts:106）
 * 维度坐标：`createRemoteBashTool` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-012.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-012 · createRemoteBashTool · 纯函数/无副作用 × 非法值", () => {
  it("works without an execution-fact collector", async () => {
    const { spawn } = fakeSpawn({ stdout: "ok" });
    const tool = createRemoteBashTool({
      transfer: fakeTransfer(),
      config: config(),
      remoteHosts: ["host"],
      executables: ["cat"],
      spawn: spawn as never,
    });
    // 步骤 2：调用 execute（无 collector——可选依赖缺省）
    const result = await tool.execute(
      "call-1",
      { host: "host", command: "cat /etc/hostname" } as never,
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    // 步骤 3：断言不抛错——collector 是可选的
    expect(result.content).toBeDefined();
  });

});
