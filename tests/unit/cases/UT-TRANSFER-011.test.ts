/**
 * Case ID: UT-TRANSFER-011  ·  STATUS: real
 *
 * 责任：参数 `deps: RemoteExecToolDeps` 的 `边界(上/下/零/空/满)` 类（remote-exec-tools.ts:106）
 * 维度坐标：`createRemoteBashTool` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-011.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-011 · createRemoteBashTool · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts deps with empty allowlists", async () => {
    const { spawn } = fakeSpawn({ stdout: "ok" });
    const collector = new ExecutionFactCollector();
    const tool = createRemoteBashTool({
      transfer: fakeTransfer(),
      config: config(),
      remoteHosts: [],
      executables: [],
      executionFacts: collector,
      spawn: spawn as never,
    });
    // 步骤 2：调用 execute（空允许表＝不限制）
    const result = await tool.execute(
      "call-1",
      { host: "any-host", command: "cat /etc/hostname" } as never,
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    // 步骤 3：断言执行成功——空允许表不拦任何主机或可执行文件
    expect(result.details?.exit_code).toBe(0);
  });

});
