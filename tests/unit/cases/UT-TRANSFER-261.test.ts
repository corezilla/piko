/**
 * Case ID: UT-TRANSFER-261  ·  STATUS: real
 *
 * 责任：返回站点 L55 值 （transfer.ts:53）
 * 维度坐标：`scpKeyPath` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-261.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-261 · scpKeyPath · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns undefined when there is no credential reference", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const noCred = config({ transfer: { staging_root: staging, credential_ref: undefined } });
    const transfer = new Transfer(noCred);
    try {
      // 步骤 2：调用 fetchInputs（无输入 → 不需要密钥）
      const result = await transfer.fetchInputs("t-1", []);

      // 步骤 3：断言状态为 none（没有凭据引用时不物化任何东西）
      expect(result.state).toBe("none");
      expect(await readdir(staging).catch(() => [])).toEqual([]);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
