/**
 * Case ID: UT-TRANSFER-234  ·  STATUS: real
 *
 * 责任：返回站点 L29 值 （transfer.ts:25）
 * 维度坐标：`safeJoinIn` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-234.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-234 · safeJoinIn · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the resolved path inside the base", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    const transfer = new Transfer(cfg);
    try {
      // 步骤 1：在 base 下造一个产物
      await mkdir(`${staging}/work`, { recursive: true });
      await writeFile(`${staging}/work/out.txt`, "data", "utf8");

      // 步骤 2：调用 deliverArtifacts（产物在 base 内）
      const result = await transfer.deliverArtifacts(
        "t-1",
        ["out.txt"],
        { method: "mount", target: "/remote/allowed" },
        undefined,
        `${staging}/work`,
      );

      // 步骤 3：断言产物被读到（路径解析落在 base 内）
      expect(result.delivered).toHaveLength(1);
      expect(result.delivered[0].sha256).toMatch(/^[0-9a-f]{64}$/);
    } finally {
      transfer.close();
      await rm(staging, { recursive: true, force: true });
    }
  });

});
