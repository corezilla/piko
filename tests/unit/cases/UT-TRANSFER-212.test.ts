/**
 * Case ID: UT-TRANSFER-212  ·  STATUS: real
 *
 * 责任：分支 L213 else : { throw new PikoError("InternalError"（transfer.ts）
 * 维度坐标：`deliverArtifacts` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-212.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-212 · deliverArtifacts · 状态分支 × 合法迁移", () => {
  it("reports the object_store method as not implemented", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：在 staging 的任务目录下造一个产物
      await mkdir(`${staging}/t-1`, { recursive: true });
      await writeFile(`${staging}/t-1/out.txt`, "data", "utf8");

      // 步骤 2：调用 deliverArtifacts（object_store 方式）
      const result = await transfer.deliverArtifacts(
        "t-1",
        ["out.txt"],
        { method: "object_store", target: "/remote/allowed" },
      );

      // 步骤 3：断言失败且错误逐值指出未实现
      expect(result.state).toBe("failed");
      expect(result.failed[0].error).toContain("object_store transport not implemented");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
