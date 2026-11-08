/**
 * Case ID: UT-TRANSFER-235  ·  STATUS: real
 *
 * 责任：参数 `stagingRoot: string` 的 `空` 类（transfer.ts:31）
 * 维度坐标：`safeJoin` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-235.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-235 · safeJoin · 字符串/路径/枚举输入 × 空", () => {
  it("rejects a path that escapes an empty staging root", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs（dest 逃出 staging）
      const result = await transfer.fetchInputs("t-1", [
        { source: "/remote/allowed", dest: "../../escape.txt" },
      ]);

      // 步骤 3：断言失败被记下
      expect(result.state).toBe("failed");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
