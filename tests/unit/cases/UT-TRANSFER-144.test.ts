/**
 * Case ID: UT-TRANSFER-144  ·  STATUS: real
 *
 * 责任：返回站点 L16 值 `new Promise((res, rej) => { execFile(cm…` 逐值断言（transfer.ts）
 * 维度坐标：`run` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-144.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin, run } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-144 · run · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the stdout and stderr of the child", async () => {
    // 步骤 1：调用 run("sh", ["-c", "printf a; printf b 1>&2"])
    // 步骤 2：断言返回值逐值对账
    const result = await run("sh", ["-c", "printf a; printf b 1>&2"]);
    expect(result).toEqual({ stdout: "a", stderr: "b" });
  });

});
