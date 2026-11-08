/**
 * Case ID: UT-TRANSFER-206  ·  STATUS: real
 *
 * 责任：分支 L199 ! : !target（transfer.ts）
 * 维度坐标：`deliverArtifacts` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-206.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-206 · deliverArtifacts · 状态分支 × 合法迁移", () => {
  it("returns the none state when there is no target", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 deliverArtifacts（无目标）
      const result = await transfer.deliverArtifacts("t-1", ["out.txt"], undefined as never);

      // 步骤 3：断言状态为 none
      expect(result.state).toBe("none");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
