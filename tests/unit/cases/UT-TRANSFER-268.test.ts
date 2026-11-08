/**
 * Case ID: UT-TRANSFER-268  ·  STATUS: real
 *
 * 责任：返回站点 L84 值 （transfer.ts:75）
 * 维度坐标：`stagingRoot` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-268.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-268 · stagingRoot · 纯函数/无副作用 × 每等价类合法值", () => {
  it("stages under the configured workspace staging root", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 2：调用 fetchInputs（有输入 → 建任务目录）
      await transfer.fetchInputs("t-1", [{ source: "/remote/nope", dest: "a.txt" }]);

      // 步骤 3：断言目录建在配置的 staging_root 下（不是别处）
      expect((await stat(`${staging}/t-1`)).isDirectory()).toBe(true);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
