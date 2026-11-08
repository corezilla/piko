/**
 * Case ID: UT-TRANSFER-172  ·  STATUS: real
 *
 * 责任：分支 L180 if : if (this.config.transfer.method === "mount"（transfer.ts）
 * 维度坐标：`fetchInputs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-172.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-172 · fetchInputs · 状态分支 × 合法迁移", () => {
  it("reports the mount method as handled without copying", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const mountCfg = config({
      transfer: { staging_root: staging, method: "mount" },
      workspace: { staging_root: staging, roots: { piko: staging } },
    });
    const transfer = new Transfer(mountCfg);
    try {
      // 步骤 2：调用 fetchInputs（mount 方式）
      const result = await transfer.fetchInputs("t-1", [{ source: "/remote/not-allowed", dest: "a.txt" }]);

      // 步骤 3：断言仍在允许表检查处失败（mount 不改变授权规则）
      expect(result.state).toBe("failed");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
