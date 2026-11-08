/**
 * Case ID: UT-TRANSFER-245  ·  STATUS: real
 *
 * 责任：throw L35 InvalidRequest（守卫 `if (relCheck.startsWith("..") || isAbsolute(relCheck))`；transfer.ts）
 * 维度坐标：`safeJoin` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-245.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-245 · safeJoin · 错误路径 × 每个 typed 错误码", () => {
  it("reports the declared staging-escape error", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs（逃逸 dest）
      const result = await transfer.fetchInputs("t-1", [
        { source: "/remote/allowed", dest: "../escape.txt" },
      ]);

      // 步骤 3：断言错误消息逐值对账
      expect(result.failed[0].error).toContain("path escapes staging");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
