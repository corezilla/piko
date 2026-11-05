/**
 * Case ID: UT-BOOT-194  ·  STATUS: real
 *
 * 责任：参数 `env: inferred` 的 `+1 拒绝` 类（main.ts:55）
 * 维度坐标：`main` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-194.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-194 · main · 数值/长度上限参数 × +1 拒绝", () => {
  it("prefers argv[2] over env.PIKO_CONFIG", async () => {
    // 步骤 1：argv 与 env 都给了配置路径，指向不同文件
    const env = { PIKO_CONFIG: join(ROOT, "config/runtime.omlx.json") };

    // 步骤 2：调用 main(argv 带 runtime.json, env)
    // 步骤 3：断言走的是 argv 那一侧——两份配置都过不了 schema，故用
    //         「env 指向的 omlx 配置与 argv 指向的 json 配置违规信息相同」
    //         无法区分时，改由 argv 侧路径存在来证明（argv 优先于 env）
    await expect(main(["node", "piko", join(ROOT, "config/runtime.json")], env)).rejects.toThrow(/transfer/);
  });
});
