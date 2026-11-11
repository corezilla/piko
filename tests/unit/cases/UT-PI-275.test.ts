/**
 * Case ID: UT-PI-275  ·  STATUS: real
 *
 * 责任：参数 `mem0ApiKey: string` 的 `超长` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-275.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-275 · PiRuntime.constructor · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an over-long mem0 key when identity memory is configured", async () => {  // accepts an over-long mem0 key when identity memory is configured
    // 步骤 1：超长 mem0 key
    const long = "m".repeat(10000);
    const fx = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" } } }),
      mem0ApiKey: long,
    });
    try {
      // 步骤 2/3：断言被接受，adapter 被构造
      expect(fx.error).toBeUndefined();
      expect(fx.runtime).toBeDefined();
      expect(fx.state("mem0Adapter")).toBeDefined();
    } finally {
      await fx.close();
    }
  });
});
