/**
 * Case ID: UT-TRANSFER-005  ·  STATUS: real
 *
 * 责任：被测符号 `safeJoin`（TRANSFER）在对象类型 `字符串/路径/枚举输入` 下的维度格 `空`（该 Case 只登记本行 1 格）、`超长`、`注入字符`、`未知枚举/路径穿越`；只测该符号该类型
 * 维度坐标：`safeJoin` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-005.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { DurableNodeExecutionEnv } from "../../../src/durable-fs.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-005 · safeJoin · 字符串/路径/枚举输入 × 空", () => {
  it("resolves an empty relative path to the task base itself", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { chmod } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：在 staging 下造一个任务目录
      await mkdir(`${staging}/t-1`, { recursive: true });

      // 步骤 2：调用 safeJoin(staging, "t-1", "")——空相对路径
      const resolved = safeJoin(staging, "t-1", "");

      // 步骤 3：断言返回值逐值对账——resolve(base, "") ＝ base，
      //         空相对路径落在任务目录本身，不逃逸也不被拒
      expect(resolved).toBe(`${staging}/t-1`);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
