/**
 * Case ID: UT-TRANSFER-207  ·  STATUS: real
 *
 * 责任：分支 L203 loop : loop (outputPaths)（transfer.ts）
 * 维度坐标：`deliverArtifacts` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-207.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-207 · deliverArtifacts · 状态分支 × 合法迁移", () => {
  it("delivers every output path", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：在 staging 的任务目录下造两个产物
      await mkdir(`${staging}/t-1`, { recursive: true });
      await writeFile(`${staging}/t-1/a.txt`, "a", "utf8");
      await writeFile(`${staging}/t-1/b.txt`, "bb", "utf8");

      // 步骤 2：调用 deliverArtifacts（两个产物，mount 方式）
      const result = await transfer.deliverArtifacts(
        "t-1",
        ["a.txt", "b.txt"],
        { method: "mount", target: "/remote/allowed" },
      );

      // 步骤 3：断言两个产物都被送出（循环走完）
      expect(result.delivered).toHaveLength(2);
      expect(result.state).toBe("delivered");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
