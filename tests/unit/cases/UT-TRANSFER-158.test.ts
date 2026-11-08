/**
 * Case ID: UT-TRANSFER-158  ·  STATUS: real
 *
 * 责任：参数 `refs: InputRef[]` 的 `每等价类合法值` 类（transfer.ts:166）
 * 维度坐标：`fetchInputs` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-158.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-158 · fetchInputs · 纯函数/无副作用 × 每等价类合法值", () => {
  it("reports a not-allowlisted source as failed", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs("t-1", [一个不在允许表里的源])
      const result = await transfer.fetchInputs("t-1", [{ source: "/remote/not-allowed", dest: "a.txt" }]);

      // 步骤 3：断言状态为 failed 且错误逐值指出目标未被允许
      expect(result.state).toBe("failed");
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].error).toContain("not allowlisted");
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
