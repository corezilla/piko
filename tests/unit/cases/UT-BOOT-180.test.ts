/**
 * Case ID: UT-BOOT-180  ·  STATUS: real
 *
 * 责任：分支 L37 `if (outcome === "StopRequested")`（if；main.ts）
 * 维度坐标：`runControlProcess` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-180.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-180 · runControlProcess · 状态分支 × 合法迁移", () => {
  it("never registers the stop hook: the schema step rejects first", async () => {
    // 当前实况（G-UT-CONFIG-1）：loadConfig 先拒绝，ApiServer.create 与
    // 取消回调（outcome === "StopRequested"）从未被注册。
    await expect(runControlProcess(join(ROOT, "config/runtime.json"), ROOT)).rejects.toThrow(/transfer/);
  });
});
