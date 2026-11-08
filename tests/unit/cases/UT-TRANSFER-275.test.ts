/**
 * Case ID: UT-TRANSFER-275  ·  STATUS: real
 *
 * 责任：throw L90 InputFetchFailed（守卫 `if (!allow.some((a) => target.startsWith(a)))`；transfer.ts:87）
 * 维度坐标：`assertAllowed` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-275.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-275 · assertAllowed · 错误路径 × 每个 typed 错误码", () => {
  it("reports the declared allowlist error", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 deliverArtifacts（目标不在允许表内）
      // 步骤 3：断言错误消息逐值对账
      await expect(
        transfer.deliverArtifacts("t-1", ["out.txt"], { method: "scp", target: "/remote/nope" }),
      ).rejects.toThrow("transfer target not allowlisted: /remote/nope");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
