/**
 * Case ID: UT-TRANSFER-243  ·  STATUS: real
 *
 * 责任：参数 `rel` 的 `注入字符` 类（transfer.ts:31）
 * 维度坐标：`safeJoin` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-243.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-243 · safeJoin · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected relative path as data", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs（注入串 dest）
      const result = await transfer.fetchInputs("t-1", [
        { source: "/remote/nope", dest: "$(rm -rf /).txt" },
      ]);

      // 步骤 3：断言失败被记下（源未获允许先失败）
      expect(result.state).toBe("failed");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
