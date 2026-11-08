/**
 * Case ID: UT-TRANSFER-244  ·  STATUS: real
 *
 * 责任：分支 L35 || : relCheck.startsWith("..") || isAbsolute（transfer.ts）
 * 维度坐标：`safeJoin` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-244.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-244 · safeJoin · 状态分支 × 合法迁移", () => {
  it("rejects an absolute destination in the staging join", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs（绝对 dest）
      const result = await transfer.fetchInputs("t-1", [
        { source: "/remote/nope", dest: "/etc/passwd" },
      ]);

      // 步骤 3：断言失败被记下（绝对路径被拒）
      expect(result.state).toBe("failed");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
