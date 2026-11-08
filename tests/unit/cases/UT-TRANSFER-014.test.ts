/**
 * Case ID: UT-TRANSFER-014  ·  STATUS: real
 *
 * 责任：返回站点 L109 值 `{ name: "remote_bash", label: "Remote b…` 逐值断言（remote-exec-tools.ts）
 * 维度坐标：`createRemoteBashTool` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-014.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-014 · createRemoteBashTool · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the tool descriptor with its declared name", async () => {
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
    // 步骤 2：断言返回值逐值对账
    expect(tool.name).toBe("remote_bash");
    expect(tool.label).toBe("Remote bash");
    expect(tool.description).toContain("remote host");
    expect(typeof tool.execute).toBe("function");
  });

});
