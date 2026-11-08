/**
 * Case ID: UT-TRANSFER-284  ·  STATUS: real
 *
 * 责任：参数 `direction` 的 `非法值` 类（transfer.ts:94）
 * 维度坐标：`scpArgs` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-284.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-284 · scpArgs · 纯函数/无副作用 × 非法值", () => {
  it("treats an unknown direction as a push", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const { spawn, calls } = fakeScp([{ error: null, stdout: "", stderr: "" }]);
    const transfer = new Transfer(cfg, spawn as never);
    try {
      // 步骤 1：在 staging 的任务目录下造一个产物
      await mkdir(`${staging}/t-1`, { recursive: true });
      await writeFile(`${staging}/t-1/out.txt`, "data", "utf8");

      // 步骤 2：调用 deliverArtifacts（目标方式非法 → 走 object_store 的未实现分支，
      //         不会走到 scpArgs，故没有 scp 调用）
      const result = await transfer.deliverArtifacts(
        "t-1",
        ["out.txt"],
        { method: "sideways" as never, target: "/remote/allowed" },
      );

      // 步骤 3：断言失败被记下，且没有发起 scp 调用
      expect(calls).toHaveLength(0);
      expect(result.state).toBe("failed");
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
