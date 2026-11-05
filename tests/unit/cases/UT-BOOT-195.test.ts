/**
 * Case ID: UT-BOOT-195  ·  STATUS: real
 *
 * 责任：参数 `env: inferred` 的 `−1 通过` 类（main.ts:55）
 * 维度坐标：`main` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-195.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-195 · main · 数值/长度上限参数 × −1 通过", () => {
  it("falls back to config/runtime.json when neither argv nor env provides one", async () => {
    // 步骤 1：构造空 env 与无 argv[2] 的 argv
    // 步骤 2：调用 main(["node", "piko"], {})
    // 步骤 3：断言落到默认路径 config/runtime.json（同样表现为 schema 违规）
    await expect(main(["node", "piko"], {})).rejects.toThrow(/transfer/);
  });
});
