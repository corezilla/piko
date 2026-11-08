/**
 * Case ID: UT-TRANSFER-017  ·  STATUS: real
 *
 * 责任：参数 `_toolCallId: inferred` 的 `非法值` 类（remote-exec-tools.ts:114）
 * 维度坐标：`execute` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-017.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-017 · execute · 纯函数/无副作用 × 非法值", () => {
  it("ignores a tool call id of the wrong type", async () => {
    const { spawn } = fakeSpawn({ stdout: "ok" });
    const collector = new ExecutionFactCollector();
    const tool = createRemoteBashTool({
      transfer: fakeTransfer(),
      config: config(),
      remoteHosts: ["host"],
      executables: ["cat"],
      executionFacts: collector,
      spawn: spawn as never,
    });
    // 步骤 2：调用 execute（非字符串 tool call id）
    const result = await tool.execute(
      42 as never,
      { host: "host", command: "cat /etc/hostname" } as never,
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    // 步骤 3：断言执行成功——该参数不被读，故非法类型无影响
    expect(result.details?.exit_code).toBe(0);
  });

});
