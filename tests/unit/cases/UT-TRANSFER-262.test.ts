/**
 * Case ID: UT-TRANSFER-262  ·  STATUS: real
 *
 * 责任：返回站点 L56 值 （transfer.ts:53）
 * 维度坐标：`scpKeyPath` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-262.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-262 · scpKeyPath · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the same key path on the second call", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：连续调用两次 sshCommandArgs
      const first = await transfer.sshCommandArgs("h1", ["echo"]);
      const second = await transfer.sshCommandArgs("h2", ["echo"]);

      // 步骤 3：断言两次的 -i 指向同一个文件
      expect(first[first.indexOf("-i") + 1]).toBe(second[second.indexOf("-i") + 1]);
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
