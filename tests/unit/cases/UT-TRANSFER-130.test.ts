/**
 * Case ID: UT-TRANSFER-130  ·  STATUS: real
 *
 * 责任：参数 `cmd: string` 的 `空` 类（transfer.ts:15）
 * 维度坐标：`run` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-130.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-130 · run · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty command", async () => {
    // 步骤 1：构造一个空的 cmd
    // 步骤 2：调用 run("", [])
    // 步骤 3：断言被拒——空文件名不是可执行的命令
    await expect(run("", [])).rejects.toThrow(/cannot be empty/i);
  });

});
