/**
 * Case ID: UT-TRANSFER-131  ·  STATUS: real
 *
 * 责任：参数 `cmd: string` 的 `超长` 类（transfer.ts:15）
 * 维度坐标：`run` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-131.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-131 · run · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects an over-long command name", async () => {
    // 步骤 1：构造一个 5000 字符的 cmd（远超 PATH_MAX）
    // 步骤 2：调用 run(超长, [])
    // 步骤 3：断言被拒——内核拒绝这么长的可执行文件名
    await expect(run("x".repeat(5000), [])).rejects.toThrow(/ENAMETOOLONG/);
  });

});
