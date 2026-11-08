/**
 * Case ID: UT-TRANSFER-142  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1：被调方 `被调方` 拒绝必须 typed 化上抛（transfer.ts:15）
 * 维度坐标：`run` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-142.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-142 · run · 错误路径 × 每个 typed 错误码", () => {
  it("propagates the child's exit failure to the caller", async () => {
    // 步骤 1：调用 run("sh", ["-c", "exit 3"])
    // 步骤 2：断言错误带上退出码，不被吞掉
    await expect(run("sh", ["-c", "exit 3"])).rejects.toMatchObject({ code: 3 });
  });

});
