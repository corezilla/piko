/**
 * Case ID: UT-TRANSFER-159  ·  STATUS: real
 *
 * 责任：参数 `refs` 的 `边界(上/下/零/空/满)` 类（transfer.ts:166）
 * 维度坐标：`fetchInputs` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-159.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-159 · fetchInputs · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts an empty refs list", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs("t-1", [])
      const result = await transfer.fetchInputs("t-1", []);

      // 步骤 3：断言状态为 none（边界：没有输入要取）
      expect(result.state).toBe("none");
      expect(result.failed).toEqual([]);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
