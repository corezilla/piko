/**
 * Case ID: UT-TRANSFER-141  ·  STATUS: real
 *
 * 责任：分支 L19 `res({ stdout, stderr });`（else；transfer.ts）
 * 维度坐标：`run` × `状态分支` × `每个非法迁移拒绝`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-141.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-141 · run · 状态分支 × 每个非法迁移拒绝", () => {
  it("resolves with the streams when the child exits zero", async () => {
    // 步骤 1：调用 run("sh", ["-c", "printf out; printf err 1>&2"])
    // 步骤 3：断言 err 为假走 res 分支——stdout 与 stderr 分流
    const result = await run("sh", ["-c", "printf out; printf err 1>&2"]);
    expect(result.stdout).toBe("out");
    expect(result.stderr).toBe("err");
  });

});
