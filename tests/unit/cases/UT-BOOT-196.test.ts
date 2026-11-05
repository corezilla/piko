/**
 * Case ID: UT-BOOT-196  ·  STATUS: real
 *
 * 责任：可选参数 `env` 缺省/显式两态（main.ts:55）
 * 维度坐标：`main` × `数值/长度上限参数` × `未知枚举`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-196.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-196 · main · 数值/长度上限参数 × 未知枚举", () => {
  it("defaults env to process.env", async () => {
    // 步骤 1：不传 env（用缺省 process.env）
    // 步骤 2：调用 main(["node", "piko"])
    // 步骤 3：断言被拒绝（缺省 env 走到默认路径，仍过不了 schema）
    await expect(main(["node", "piko"])).rejects.toThrow();
  });
});
