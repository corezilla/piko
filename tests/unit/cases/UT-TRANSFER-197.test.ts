/**
 * Case ID: UT-TRANSFER-197  ·  STATUS: real
 *
 * 责任：参数 `signal` 的 `非法值` 类（transfer.ts:198）
 * 维度坐标：`deliverArtifacts` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-197.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-197 · deliverArtifacts · 纯函数/无副作用 × 每等价类合法值", () => {
  it("treats an aborted signal as a delivery failure, not a crash", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：构造一个已 abort 的 signal
      const controller = new AbortController();
      controller.abort();

      // 步骤 2：调用 deliverArtifacts
      // 步骤 3：断言不抛错，失败被记下
      const result = await transfer.deliverArtifacts(
        "t-1",
        ["missing.txt"],
        { method: "scp", target: "/remote/allowed" },
        controller.signal,
      );
      expect(result.failed).toHaveLength(1);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
