/**
 * Case ID: UT-TRANSFER-198  ·  STATUS: real
 *
 * 责任：可选参数 `signal` 缺省/显式两态（transfer.ts:198）
 * 维度坐标：`deliverArtifacts` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-198.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-198 · deliverArtifacts · 纯函数/无副作用 × 每等价类合法值", () => {
  it("works with and without a signal", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：缺省 signal
      const without = await transfer.deliverArtifacts("t-1", ["missing.txt"], { method: "scp", target: "/remote/allowed" });
      // 步骤 2：显式 signal
      const controller = new AbortController();
      const with_ = await transfer.deliverArtifacts(
        "t-2",
        ["missing.txt"],
        { method: "scp", target: "/remote/allowed" },
        controller.signal,
      );

      // 步骤 3：断言两者都正常返回
      expect(without.failed).toHaveLength(1);
      expect(with_.failed).toHaveLength(1);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
