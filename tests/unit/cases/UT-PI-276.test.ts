/**
 * Case ID: UT-PI-276  ·  STATUS: real
 *
 * 责任：参数 `mem0ApiKey: string` 的 `注入字符` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-276.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-276 · PiRuntime.constructor · 字符串/路径/枚举输入 × 注入字符", () => {
  it("accepts a mem0 key with injection characters and passes it to the adapter verbatim", async () => {  // accepts a mem0 key with injection characters and passes it to the adapter verbatim
    // 步骤 1：注入字符
    const injected = "abc'; DROP TABLE tasks; --";
    const fx = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" } } }),
      mem0ApiKey: injected,
    });
    try {
      // 步骤 2/3：断言被接受，adapter 拿到原样 key（只作 HTTP 头，不进 shell）
      expect(fx.error).toBeUndefined();
      const adapter = fx.state<{ apiKey: string }>("mem0Adapter");
      expect(adapter.apiKey).toBe(injected);
    } finally {
      await fx.close();
    }
  });
});
