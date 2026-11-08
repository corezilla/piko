/**
 * Case ID: UT-TRANSFER-007  ·  STATUS: real
 *
 * 责任：被测符号 `scpKeyPath`（TRANSFER）在对象类型 `资源获取/释放` 下的维度格 `获取失败路径`（该 Case 只登记本行 1 格）、`正常释放`、`异常中途释放`；只测该符号该类型
 * 维度坐标：`scpKeyPath` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-007.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { ExecutionFactCollector } from "../../../src/execution-facts.js";
import { DurableNodeExecutionEnv } from "../../../src/durable-fs.js";
import { PikoError } from "../../../src/types.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-007 · scpKeyPath · 资源获取/释放 × 获取失败路径", () => {
  it("leaves no key file behind when the credential cannot be resolved", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { chmod } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const badRef = config({ transfer: { staging_root: staging, credential_ref: "env:PIKO_UT_MISSING_KEY" } });
    const transfer = new Transfer(badRef);
    try {
      // 步骤 2：调用 sshCommandArgs（凭据解析失败）
      await expect(transfer.sshCommandArgs("h1", ["echo"])).rejects.toThrow(/missing env secret/);

      // 步骤 3：断言没有留下密钥文件——解析失败时不该有半成品
      const { readdir } = await import("node:fs/promises");
      expect(await readdir(`${staging}/.keys`).catch(() => [] as string[])).toEqual([]);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
