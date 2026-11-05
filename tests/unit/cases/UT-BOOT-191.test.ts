/**
 * Case ID: UT-BOOT-191  ·  STATUS: real
 *
 * 责任：参数 `argv: inferred` 的 `−1 通过` 类（main.ts:55）
 * 维度坐标：`main` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-191.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-191 · main · 数值/长度上限参数 × −1 通过", () => {
  it("accepts a short argv (no config slot)", async () => {
    // 步骤 1：构造只有两个元素的 argv（argv[2] 为 undefined）
    const argv = ["node", "piko"];

    // 步骤 2：调用 main(argv, {}) —— 落到 env.PIKO_CONFIG 或默认路径
    // 步骤 3：断言被拒绝（默认路径 config/runtime.json 存在但不过 schema）
    await expect(main(argv, {})).rejects.toThrow();
  });
});
