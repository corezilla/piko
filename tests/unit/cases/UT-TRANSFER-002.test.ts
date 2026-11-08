/**
 * Case ID: UT-TRANSFER-002  ·  STATUS: real
 *
 * 责任：被测符号 `clearStaging`（TRANSFER）在对象类型 `资源获取/释放` 下的维度格 `获取失败路径`（该 Case 只登记本行 1 格）、`正常释放`、`异常中途释放`；只测该符号该类型
 * 维度坐标：`clearStaging` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-002.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { DurableNodeExecutionEnv } from "../../../src/durable-fs.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-002 · clearStaging · 资源获取/释放 × 获取失败路径", () => {
  it("swallows the failure when the staging directory cannot be removed", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { chmod } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：在 staging 下造一个任务目录，再把 staging 根设成只读
      await mkdir(`${staging}/t-1`, { recursive: true });
      await chmod(staging, 0o500);

      // 步骤 2：调用 clearStaging("t-1")
      // 步骤 3：断言不抛错——清理失败被吞掉（best effort），且目录还在
      expect(() => transfer.clearStaging("t-1")).not.toThrow();
      expect((await stat(`${staging}/t-1`)).isDirectory()).toBe(true);
    } finally {
      await chmod(staging, 0o700);
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
