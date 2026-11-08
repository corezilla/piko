/**
 * Case ID: UT-TRANSFER-072  ·  STATUS: real
 *
 * 责任：分支 L120 ternary : ? options.cwd :（remote-exec.ts）
 * 维度坐标：`execRemote` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-072.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-072 · execRemote · 状态分支 × 合法迁移", () => {
  it("prepends a cd into the remote argv when cwd is given", async () => {
    // 步骤 1：构造 transfer 与 spawn 替身
    const transfer = fakeTransfer();
    const { spawn, spawned } = fakeSpawn({ stdout: "ok" });

    // 步骤 2：调用 execRemote（带 cwd）
    await execRemote({ host: "h1", argv: ["ls"], cwd: "/srv/app" }, transfer as never, config(), spawn as never);

    // 步骤 3：断言远端 argv 以 cd 开头
    const remote = transfer.calls[0].argv;
    expect(remote).toEqual(["cd", "/srv/app", "&&", "ls"]);
    expect(spawned).toHaveLength(1);
  });

});
