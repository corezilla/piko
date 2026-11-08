/**
 * Case ID: UT-TRANSFER-181  ·  STATUS: real
 *
 * 责任：资源 L171 mkdirSync（transfer.ts）
 * 维度坐标：`fetchInputs` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-181.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-181 · fetchInputs · 资源获取/释放 × 获取失败路径", () => {
  it("creates the task's staging directory before fetching", async () => {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs（有输入）
      await transfer.fetchInputs("t-1", [{ source: "/remote/nope", dest: "a.txt" }]);

      // 步骤 3：断言任务目录被建出来（取输入前先备好落点）
      const { stat } = await import("node:fs/promises");
      expect((await stat(`${staging}/t-1`)).isDirectory()).toBe(true);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
