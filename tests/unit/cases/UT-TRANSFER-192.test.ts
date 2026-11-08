/**
 * Case ID: UT-TRANSFER-192  ·  STATUS: real
 *
 * 责任：参数 `target: ArtifactTarget` 的 `每等价类合法值` 类（transfer.ts:198）
 * 维度坐标：`deliverArtifacts` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-192.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-192 · deliverArtifacts · 纯函数/无副作用 × 每等价类合法值", () => {
  it("refuses a target outside the allowlist", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 deliverArtifacts（目标不在允许表内）
      // 步骤 3：断言被拒（允许表是硬边界——在读任何产物之前就拒）
      await expect(
        transfer.deliverArtifacts("t-1", ["out.txt"], { method: "scp", target: "/remote/not-allowed" }),
      ).rejects.toThrow(/not allowlisted/);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
