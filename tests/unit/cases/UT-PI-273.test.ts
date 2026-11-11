/**
 * Case ID: UT-PI-273  ·  STATUS: real
 *
 * 责任：参数 `apiKey: string` 的 `注入字符` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-273.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor } from "./support/pi-runtime-fix.js";

describe("UT-PI-273 · PiRuntime.constructor · 字符串/路径/枚举输入 × 注入字符", () => {
  it("accepts an LLM api key with injection characters and stores it verbatim without executing it", async () => {  // accepts an LLM api key with injection characters and stores it verbatim without executing it
    // 步骤 1：注入字符 —— shell 元字符与换行
    const injected = "abc'; DROP TABLE tasks; --\n$(whoami)`id`";
    const fx = await piConstructor({ apiKey: injected });
    try {
      // 步骤 2/3：断言被接受且原样写进环境变量（key 只作为 HTTP 头使用，不进 shell）
      expect(fx.error).toBeUndefined();
      expect(process.env.PIKO_LLM_API_KEY).toBe(injected);
    } finally {
      await fx.close();
    }
  });
});
