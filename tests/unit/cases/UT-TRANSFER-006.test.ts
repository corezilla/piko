/**
 * Case ID: UT-TRANSFER-006  ·  STATUS: real
 *
 * 责任：被测符号 `scpArgs`（TRANSFER）在对象类型 `资源获取/释放` 下的维度格 `获取失败路径`（该 Case 只登记本行 1 格）、`正常释放`、`异常中途释放`；只测该符号该类型
 * 维度坐标：`scpArgs` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-006.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { DurableNodeExecutionEnv } from "../../../src/durable-fs.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-006 · scpArgs · 资源获取/释放 × 获取失败路径", () => {
  it("does not start scp when the credential skeleton cannot be built", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { chmod } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const noCred = config({ transfer: { staging_root: staging, credential_ref: undefined } });
    const { spawn, calls } = fakeScp([{ error: null, stdout: "", stderr: "" }]);
    const transfer = new Transfer(noCred, spawn as never);
    try {
      // 步骤 2：调用 fetchInputs（走 scpArgs → sshBaseArgs → 无凭据即拒）
      const result = await transfer.fetchInputs("t-1", [{ source: "/remote/allowed", dest: "a.txt" }]);

      // 步骤 3：断言失败被记下，且没有起进程——凭据拿不到就不发请求
      expect(result.state).toBe("failed");
      expect(result.failed[0].error).toContain("credential_ref is required");
      expect(calls).toHaveLength(0);
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
