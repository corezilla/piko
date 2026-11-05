/**
 * Case ID: UT-BOOT-200  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1：被调方 `runControlProcess(configPath, root)` 拒绝必须 typed 化上抛（main.ts:55）
 * 维度坐标：`main` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-200.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-200 · main · 错误路径 × 每个 typed 错误码", () => {
  it("propagates the control-process failure to the caller", async () => {
    // 步骤 1：构造指向不存在配置的 argv
    const argv = ["node", "piko", join(ROOT, "config/runtime.json")];

    // 步骤 2：调用 main(argv, {})
    // 步骤 3：断言拒绝被上抛（main 不吞错、不降级）
    await expect(main(argv, {})).rejects.toThrow(/transfer/);
  });
});
