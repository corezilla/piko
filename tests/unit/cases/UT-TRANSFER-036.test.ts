/**
 * Case ID: UT-TRANSFER-036  ·  STATUS: real
 *
 * 责任：分支 L186 `catch (e)`（catch；remote-exec-tools.ts）
 * 维度坐标：`execute` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-036.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer, textOf } from "./support/transfer-fix.js";

describe("UT-TRANSFER-036 · execute · 错误路径 × 每个 typed 错误码", () => {
  it("turns a policy refusal into a structured error result", async () => {
    const { spawn } = fakeSpawn({ stdout: "ok" });    const collector = new ExecutionFactCollector();
    const tool = createRemoteBashTool({
      transfer: fakeTransfer(),
      config: config(),
      remoteHosts: ["host"],
      executables: ["cat"],
      executionFacts: collector,
      spawn: spawn as never,
    });
    // 步骤 2：调用 execute（主机不在允许表内 → execRemote 抛 ScopeDenied）
    const result = await tool.execute(
      "call-1",
      { host: "not-allowed", command: "cat /etc/hostname" } as never,
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    // 步骤 3：断言错误被结构化返回，不冒泡给调用方
    expect(result.details?.error).toBe("ScopeDenied");
    expect(textOf(result)).toContain("ScopeDenied");
  });

});
