/**
 * Case ID: UT-PI-272  ·  STATUS: real
 *
 * 责任：参数 `apiKey: string` 的 `超长` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-272.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor } from "./support/pi-runtime-fix.js";

describe("UT-PI-272 · PiRuntime.constructor · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an over-long LLM api key and writes it to the environment verbatim", async () => {  // accepts an over-long LLM api key and writes it to the environment verbatim
    // 步骤 1：超长 key —— 10000 字符（构造器不做长度校验）
    const long = "k".repeat(10000);
    const fx = await piConstructor({ apiKey: long });
    try {
      // 步骤 2/3：断言被接受且原样透传
      expect(fx.error).toBeUndefined();
      expect(process.env.PIKO_LLM_API_KEY).toBe(long);
    } finally {
      await fx.close();
    }
  });
});
