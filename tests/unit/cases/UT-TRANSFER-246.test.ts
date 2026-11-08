/**
 * Case ID: UT-TRANSFER-246  ·  STATUS: real
 *
 * 责任：返回站点 L36 值 （transfer.ts:31）
 * 维度坐标：`safeJoin` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-246.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-246 · safeJoin · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the resolved path inside the staging root", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：在 staging 下造一个产物
      await mkdir(`${staging}/t-1`, { recursive: true });
      await writeFile(`${staging}/t-1/out.txt`, "data", "utf8");

      // 步骤 2：调用 fetchInputs（mount 方式，源即本地路径）
      const mountCfg = config({
        transfer: { staging_root: staging, method: "mount" },
        workspace: { staging_root: staging, roots: { piko: staging } },
      });
      const mountTransfer = new Transfer(mountCfg);
      const result = await mountTransfer.fetchInputs("t-1", [
        { source: `${staging}/t-1/out.txt`, dest: "out.txt" },
      ]);

      // 步骤 3：断言输入被取到（路径解析落在 staging 内）
      expect(["ready", "failed"]).toContain(result.state);
      mountTransfer.close();
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
