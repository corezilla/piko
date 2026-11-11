/**
 * Case ID: UT-PI-274  ·  STATUS: real
 *
 * 责任：参数 `mem0ApiKey: string` 的 `空` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-274.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-274 · PiRuntime.constructor · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty mem0 key when identity memory is configured", async () => {  // rejects an empty mem0 key when identity memory is configured
    // 步骤 1：配了 identity.memory，但 mem0ApiKey 是空串
    const fx = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" } } }),
      mem0ApiKey: "",
    });
    try {
      // 步骤 2/3：断言 fail-fast —— 错误消息逐值可判别
      expect(fx.error).toBeInstanceOf(Error);
      expect((fx.error as Error).message).toBe("mem0ApiKey required when identity.memory configured");
      expect(fx.runtime).toBeUndefined();
    } finally {
      await fx.close();
    }
  });
});
