/**
 * Case ID: UT-TRANSFER-191  ·  STATUS: real
 *
 * 责任：参数 `outputPaths` 的 `注入字符` 类（transfer.ts:198）
 * 维度坐标：`deliverArtifacts` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-191.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-191 · deliverArtifacts · 纯函数/无副作用 × 每等价类合法值", () => {
  it("rejects an output path that escapes the workspace", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 deliverArtifacts（一个逃出 staging 的产物路径）
      const result = await transfer.deliverArtifacts("t-1", ["../../escape.txt"], { method: "scp", target: "/remote/allowed" });

      // 步骤 3：断言状态为 failed（路径逃逸被拒）
      expect(result.state).toBe("failed");
      expect(result.failed[0].error).toContain("path escapes staging");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
