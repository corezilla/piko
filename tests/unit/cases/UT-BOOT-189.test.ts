/**
 * Case ID: UT-BOOT-189  ·  STATUS: real
 *
 * 责任：参数 `argv: inferred` 的 `恰好通过` 类（main.ts:55）
 * 维度坐标：`main` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-189.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-189 · main · 数值/长度上限参数 × 恰好通过", () => {
  it("uses argv[2] as the config path when it is present", async () => {
    // 步骤 1：构造带第三个参数的 argv，指向一份缺必填段的配置
    const argv = ["node", "piko", join(ROOT, "config/runtime.json")];

    // 步骤 2：调用 main(argv, {}) —— env 为空
    // 步骤 3：断言因该配置的 schema 违规而失败——Ajv 的错误只讲违规字段，
    //         不回显文件路径，故用「哪份配置的违规」区分 argv 与 env 哪一侧被采用
    await expect(main(argv, {})).rejects.toThrow(/transfer/);
  });
});
