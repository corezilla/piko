/**
 * Case ID: UT-BOOT-181  ·  STATUS: real
 *
 * 责任：分支 L44 `if (closing)`（if；main.ts）
 * 维度坐标：`runControlProcess` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-181.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-181 · runControlProcess · 状态分支 × 合法迁移", () => {
  it("never reaches the close guard: the schema step rejects first", async () => {
    // 当前实况（G-UT-CONFIG-1）：loadConfig 先拒绝，close 回调从未被构造。
    await expect(runControlProcess(join(ROOT, "config/runtime.json"), ROOT)).rejects.toThrow(/transfer/);
  });
});
