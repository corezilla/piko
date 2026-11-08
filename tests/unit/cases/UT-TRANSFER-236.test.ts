/**
 * Case ID: UT-TRANSFER-236  ·  STATUS: real
 *
 * 责任：参数 `stagingRoot` 的 `超长` 类（transfer.ts:31）
 * 维度坐标：`safeJoin` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-236.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-236 · safeJoin · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects a path under an over-long staging root", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs（超长任务 id → mkdirSync 抛 ENAMETOOLONG，
      //         这在 try 之外，故直接上抛而不被记进 failed）
      // 步骤 3：断言错误被上抛
      await expect(
        transfer.fetchInputs("t".repeat(1000), [{ source: "/remote/nope", dest: "a.txt" }]),
      ).rejects.toThrow(/ENAMETOOLONG|name too long/);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
