/**
 * Case ID: UT-TRANSFER-182  ·  STATUS: real
 *
 * 责任：资源 L180 writeFileSync（transfer.ts）
 * 维度坐标：`fetchInputs` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-182.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-182 · fetchInputs · 资源获取/释放 × 获取失败路径", () => {
  it("keeps the staging root clean when nothing was fetched", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs（无输入 → 什么都不写）
      await transfer.fetchInputs("t-1", []);

      // 步骤 3：断言没有留下半拉文件
      const { readdir } = await import("node:fs/promises");
      const entries = await readdir(staging).catch(() => [] as string[]);
      expect(entries).toEqual([]);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
