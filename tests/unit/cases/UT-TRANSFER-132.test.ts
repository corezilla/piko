/**
 * Case ID: UT-TRANSFER-132  ·  STATUS: real
 *
 * 责任：参数 `cmd: string` 的 `注入字符` 类（transfer.ts:15）
 * 维度坐标：`run` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-132.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-132 · run · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected command as a single program name", async () => {
    // 步骤 1：构造一个带 shell 元字符的 cmd
    // 步骤 2：调用 run("echo hi; rm -rf /", [])
    // 步骤 3：断言被当作单个程序名——不经 shell，故 `;` 不会被解释
    await expect(run("echo hi; rm -rf /", [])).rejects.toThrow(/ENOENT/);
  });

});
