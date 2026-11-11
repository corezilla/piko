/**
 * Case ID: UT-PI-306  ·  STATUS: real
 *
 * 责任：throw L123 `mem0ApiKey required when identity.memory configured`（守卫 `if (config.identity?…
 * 维度坐标：`PiRuntime.constructor` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-306.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-306 · PiRuntime.constructor · 错误路径 × 每个 typed 错误码", () => {
  it("throws the typed mem0 key error when identity memory is configured without a key", async () => {  // throws the typed mem0 key error when identity memory is configured without a key
    // 步骤 1：构造触发 L123 throw 的输入
    const fx = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" } } }),
    });
    try {
      // 步骤 2：断言错误被抛出，消息逐值相等
      expect(fx.error).toBeInstanceOf(Error);
      expect((fx.error as Error).message).toBe("mem0ApiKey required when identity.memory configured");

      // 步骤 3：断言消息可判别、含建议动作，且无部分写入
      // 消息是纯 ASCII 的固定串，含「required when … configured」的判别措辞
      expect((fx.error as Error).message).toMatch(/required when identity\.memory configured/);
      expect(fx.runtime).toBeUndefined();
      expect(fx.facts).toEqual([]);

      // 步骤 4：断言内部错误不上抛为客户端码
      // —— 实现抛的是普通 Error（无 code/status），按 G-UT-PI-2 登记为「错误不 typed 化」
      expect((fx.error as { code?: unknown }).code).toBeUndefined();
    } finally {
      await fx.close();
    }
  });
});
