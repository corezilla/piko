/**
 * Case ID: UT-TRANSFER-010  ·  STATUS: real
 *
 * 责任：参数 `deps: RemoteExecToolDeps` 的 `每等价类合法值` 类（remote-exec-tools.ts:106）
 * 维度坐标：`createRemoteBashTool` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-010.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-010 · createRemoteBashTool · 纯函数/无副作用 × 每等价类合法值", () => {
  it("builds the remote_bash tool from the given deps", async () => {
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
    // 步骤 2：断言工具的名字、标签与参数模式
    expect(tool.name).toBe("remote_bash");
    expect(tool.label).toBe("Remote bash");
    expect(tool.parameters).toBeDefined();
  });

});
