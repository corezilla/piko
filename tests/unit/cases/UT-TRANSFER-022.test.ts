/**
 * Case ID: UT-TRANSFER-022  ·  STATUS: real
 *
 * 责任：参数 `_onUpdate: inferred` 的 `边界(上/下/零/空/满)` 类（remote-exec-tools.ts:114）
 * 维度坐标：`execute` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-022.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-022 · execute · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("runs with an update callback that is never invoked", async () => {
    const { spawn } = fakeSpawn({ stdout: "ok" });
    let updates = 0;
    const collector = new ExecutionFactCollector();
    const tool = createRemoteBashTool({
      transfer: fakeTransfer(),
      config: config(),
      remoteHosts: ["host"],
      executables: ["cat"],
      executionFacts: collector,
      spawn: spawn as never,
    });
    // 步骤 2：调用 execute（onUpdate 是一个不被调用的回调）
    const result = await tool.execute(
      "call-1",
      { host: "host", command: "cat /etc/hostname" } as never,
      () => { updates += 1; },
      {} as never,
      {} as never,
      {} as never,
    );
    // 步骤 3：断言执行成功且没有流式更新——远端执行是整体返回的
    expect(updates).toBe(0);
    expect(result.details?.exit_code).toBe(0);
  });

});
