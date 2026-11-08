/**
 * Case ID: UT-TRANSFER-282  ·  STATUS: real
 *
 * 责任：参数 `direction: "pull" | "push"` 的 `每等价类合法值` 类（transfer.ts:94）
 * 维度坐标：`scpArgs` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-282.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeScp, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-282 · scpArgs · 纯函数/无副作用 × 每等价类合法值", () => {
  it("puts the remote first on a pull", async () => {
  const { mkdtemp, rm, mkdir, writeFile, stat } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const staging = await mkdtemp(join(tmpdir(), "piko-transfer-"));
  const cfg = config({ transfer: { staging_root: staging }, workspace: { staging_root: staging, roots: { piko: staging } } });    process.env.PIKO_UT_SCP_KEY = "KEY";
    const { spawn, calls } = fakeScp([{ error: null, stdout: "", stderr: "" }]);    const transfer = new Transfer(cfg, spawn as never);
    try {
      // 步骤 2：调用 fetchInputs（拉取方向）
      await transfer.fetchInputs("t-1", [{ source: "/remote/allowed", dest: "a.txt" }]);

      // 步骤 3：断言拉取方向下远端在前、本地在后
      expect(calls).toHaveLength(1);
      const args = calls[0].args;
      expect(args[args.indexOf("--") + 1]).toBe("/remote/allowed");
      expect(args[args.indexOf("--") + 2]).toBe(`${staging}/t-1/a.txt`);
    } finally {
      transfer.close();
      delete process.env.PIKO_UT_SCP_KEY;
      await rm(staging, { recursive: true, force: true });
    }
  });

});
