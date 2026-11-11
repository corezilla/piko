/**
 * Case ID: UT-PI-271  ·  STATUS: real
 *
 * 责任：参数 `apiKey: string` 的 `空` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-271.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor } from "./support/pi-runtime-fix.js";

describe("UT-PI-271 · PiRuntime.constructor · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty LLM api key and writes it to the environment verbatim", async () => {  // accepts an empty LLM api key and writes it to the environment verbatim
    // 步骤 1：空串 key
    const fx = await piConstructor({ apiKey: "" });
    try {
      // 步骤 2/3：断言被接受，且 PIKO_LLM_API_KEY 被原样写成空串
      expect(fx.error).toBeUndefined();
      expect(process.env.PIKO_LLM_API_KEY).toBe("");
    } finally {
      await fx.close();
    }
  });
});
