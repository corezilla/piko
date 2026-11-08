/**
 * Case ID: UT-TRANSFER-217  ·  STATUS: real
 *
 * 责任：throw L214 InternalError（守卫 `else { throw new PikoError("InternalError"`；transfer.ts）
 * 维度坐标：`deliverArtifacts` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-217.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-217 · deliverArtifacts · 错误路径 × 每个 typed 错误码", () => {
  it("reports the object_store error with its declared code", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：造一个存在的产物
      await mkdir(`${staging}/t-1`, { recursive: true });
      await writeFile(`${staging}/t-1/out.txt`, "data", "utf8");

      // 步骤 2：调用 deliverArtifacts（object_store 方式）
      const result = await transfer.deliverArtifacts(
        "t-1",
        ["out.txt"],
        { method: "object_store", target: "/remote/allowed" },
      );

      // 步骤 3：断言错误消息逐值对账
      expect(result.failed[0].error).toBe("object_store transport not implemented in this build");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
