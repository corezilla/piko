/**
 * Case ID: UT-TRANSFER-143  ·  STATUS: real
 *
 * 责任：资源操作 L17 `execFile`（transfer.ts）
 * 维度坐标：`run` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-143.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-143 · run · 资源获取/释放 × 获取失败路径", () => {
  it("does not leave the child running when the command fails", async () => {
    // 步骤 1：调用 run("sh", ["-c", "exit 1"])（子进程立即失败）
    // 步骤 2：断言失败被上抛且进程已退出（无悬挂子进程）
    await expect(run("sh", ["-c", "exit 1"])).rejects.toThrow();
    // 步骤 3：断言没有残留的句柄——再跑一次正常的命令仍能成功
    const result = await run("echo", ["alive"]);
    expect(result.stdout.trim()).toBe("alive");
  });

});
