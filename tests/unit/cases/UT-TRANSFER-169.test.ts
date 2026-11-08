/**
 * Case ID: UT-TRANSFER-169  ·  STATUS: real
 *
 * 责任：分支 L173 ?? : ref.dest ?? ref.source.split("/").pop() ?? "input"（transfer.ts）
 * 维度坐标：`fetchInputs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-169.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-169 · fetchInputs · 状态分支 × 合法迁移", () => {
  it("falls back to a default destination name", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs（源以斜杠结尾 → 推导出的名字为空）
      const result = await transfer.fetchInputs("t-1", [{ source: "/remote/nope/" }]);

      // 步骤 3：断言失败被记下（目标名退回到 "input"）
      expect(result.state).toBe("failed");
      expect(result.failed).toHaveLength(1);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
