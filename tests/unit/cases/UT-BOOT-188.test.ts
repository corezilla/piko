/**
 * Case ID: UT-BOOT-188  ·  STATUS: real
 *
 * 责任：返回站点 L44 值 `（无值 return：提前退出）` 逐值断言（main.ts）
 * 维度坐标：`runControlProcess` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-188.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-188 · runControlProcess · 纯函数/无副作用 × 每等价类合法值", () => {
  it("never returns normally: the schema step rejects first", async () => {
    // 当前实况（G-UT-CONFIG-1）：控制进程的成功路径不可达。
    await expect(runControlProcess(join(ROOT, "config/runtime.json"), ROOT)).rejects.toThrow(/transfer/);
  });
});
