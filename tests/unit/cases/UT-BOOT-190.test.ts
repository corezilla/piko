/**
 * Case ID: UT-BOOT-190  ·  STATUS: real
 *
 * 责任：参数 `argv: inferred` 的 `+1 拒绝` 类（main.ts:55）
 * 维度坐标：`main` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-190.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-190 · main · 数值/长度上限参数 × +1 拒绝", () => {
  it("uses the next argv slot as the config path", async () => {
    // 步骤 1：构造第四个参数也在的 argv（argv[3] 不被使用）
    const argv = ["node", "piko", join(ROOT, "config/runtime.json"), "extra"];

    // 步骤 2：调用 main(argv, {})
    // 步骤 3：断言用的是 argv[2]（不是 argv[3]）——argv[3] 指向的不是配置，
    //         若被采用则报的是文件不存在而非 schema 违规
    await expect(main(argv, {})).rejects.toThrow(/transfer/);
  });
});
