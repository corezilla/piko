/**
 * Case ID: UT-BOOT-193  ·  STATUS: real
 *
 * 责任：参数 `env: inferred` 的 `恰好通过` 类（main.ts:55）
 * 维度坐标：`main` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-193.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-193 · main · 数值/长度上限参数 × 恰好通过", () => {
  it("uses env.PIKO_CONFIG when argv has no config slot", async () => {
    // 步骤 1：构造无 argv[2] 且带 PIKO_CONFIG 的 env
    const env = { PIKO_CONFIG: join(ROOT, "config/runtime.json") };

    // 步骤 2：调用 main(["node", "piko"], env)
    // 步骤 3：断言因该配置的 schema 违规而失败——证明 env.PIKO_CONFIG 被采用
    //         （若未采用，argv 无槽位会落到默认路径，报的是另一个配置的违规）
    await expect(main(["node", "piko"], env)).rejects.toThrow(/transfer/);
  });
});
