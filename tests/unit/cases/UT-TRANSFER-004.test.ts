/**
 * Case ID: UT-TRANSFER-004  ·  STATUS: real
 *
 * 责任：被测符号 `fetchInputs`（TRANSFER）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`fetchInputs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-004.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { DurableNodeExecutionEnv } from "../../../src/durable-fs.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-004 · fetchInputs · 状态分支 × 合法迁移", () => {
  it("moves from none to ready when every input is fetched", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { chmod } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    // mount 方式：源就是本地路径
    const mountCfg = config({
      transfer: { staging_root: staging, method: "mount" },
      workspace: { staging_root: staging, roots: { piko: staging } },
    });
    const transfer = new Transfer(mountCfg);
    try {
      // 步骤 1：在 staging 的任务目录下造一个可取的输入
      await mkdir(`${staging}/t-1`, { recursive: true });
      await writeFile(`${staging}/t-1/out.txt`, "data", "utf8");

      // 步骤 2：调用 fetchInputs（mount 方式：源在允许表内、落点是本地路径）
      const result = await transfer.fetchInputs("t-1", [
        { source: "/remote/allowed/out.txt", dest: "out.txt" },
      ]);

      // 步骤 3：断言状态迁移合法——none → ready
      expect(result.state).toBe("ready");
      expect(result.fetched).toHaveLength(1);
      expect(result.failed).toEqual([]);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
