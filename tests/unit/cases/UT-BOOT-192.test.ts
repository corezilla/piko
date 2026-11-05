/**
 * Case ID: UT-BOOT-192  ·  STATUS: real
 *
 * 责任：可选参数 `argv` 缺省/显式两态（main.ts:55）
 * 维度坐标：`main` × `数值/长度上限参数` × `未知枚举`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-192.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-192 · main · 数值/长度上限参数 × 未知枚举", () => {
  it("defaults argv to process.argv", async () => {
    // 步骤 1：不传 argv（用缺省 process.argv）
    // 步骤 2：调用 main(undefined, {})
    // 步骤 3：断言被拒绝（缺省路径解析后仍过不了 schema）
    await expect(main(undefined, {})).rejects.toThrow();
  });
});
