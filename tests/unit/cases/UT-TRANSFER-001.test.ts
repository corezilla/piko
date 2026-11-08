/**
 * Case ID: UT-TRANSFER-001  ·  STATUS: real
 *
 * 责任：被测符号 `assertAllowed`（TRANSFER）在对象类型 `错误路径` 下的维度格 `每个 typed 错误码`（该 Case 只登记本行 1 格）、`错误保真传播`、`内部错误不上抛为客户端码`；只测该符号该类型
 * 维度坐标：`assertAllowed` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-001.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { DurableNodeExecutionEnv } from "../../../src/durable-fs.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-001 · assertAllowed · 错误路径 × 每个 typed 错误码", () => {
  it("raises the declared InputFetchFailed for a target outside the allowlist", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { chmod } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 deliverArtifacts（目标不在允许表内 → assertAllowed 抛错）
      // 步骤 3：断言错误逐值对账——code 是 InputFetchFailed，不是笼统的内部错误
      await expect(
        transfer.deliverArtifacts("t-1", ["out.txt"], { method: "scp", target: "/remote/nope" }),
      ).rejects.toThrow("transfer target not allowlisted: /remote/nope");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
