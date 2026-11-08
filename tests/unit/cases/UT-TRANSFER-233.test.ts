/**
 * Case ID: UT-TRANSFER-233  ·  STATUS: real
 *
 * 责任：throw L28 InvalidRequest（守卫 `if (relCheck.startsWith("..") || isAbsolute(relCheck))`；transfer.ts）
 * 维度坐标：`safeJoinIn` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-233.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-233 · safeJoinIn · 错误路径 × 每个 typed 错误码", () => {
  it("reports the declared path-escape error", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 deliverArtifacts（逃逸路径）
      const result = await transfer.deliverArtifacts(
        "t-1",
        ["../escape.txt"],
        { method: "mount", target: "/remote/allowed" },
        undefined,
        staging,
      );

      // 步骤 3：断言错误消息逐值对账
      expect(result.failed[0].error).toContain("path escapes workspace");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
