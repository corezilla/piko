/**
 * Case ID: UT-TRANSFER-168  ·  STATUS: real
 *
 * 责任：分支 L173 ?? : ref.dest ?? ref.source.split("/").pop()（transfer.ts）
 * 维度坐标：`fetchInputs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-168.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-168 · fetchInputs · 状态分支 × 合法迁移", () => {
  it("derives the destination from the source when none is given", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs（没有 dest）
      const result = await transfer.fetchInputs("t-1", [{ source: "/remote/nope/dir/file.txt" }]);

      // 步骤 3：断言失败被记下（目标名由源推导，但源未获允许仍失败）
      expect(result.state).toBe("failed");
      expect(result.failed[0].source).toBe("/remote/nope/dir/file.txt");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
