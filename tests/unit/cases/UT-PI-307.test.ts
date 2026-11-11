/**
 * Case ID: UT-PI-307  ·  STATUS: real
 *
 * 责任：throw L137 `graphragApiKey required when identity.doc_search configured`（守卫 `if (config.i…
 * 维度坐标：`PiRuntime.constructor` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-307.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-307 · PiRuntime.constructor · 错误路径 × 每个 typed 错误码", () => {
  it("throws the typed graphrag key error when identity doc_search is configured without a key", async () => {  // throws the typed graphrag key error when identity doc_search is configured without a key
    // 步骤 1：构造触发 L137 throw 的输入
    const fx = await piConstructor({
      config: piConfig({ identity: piIdentity({ doc_search: {} }) }),
    });
    try {
      // 步骤 2：断言错误被抛出，消息逐值相等
      expect(fx.error).toBeInstanceOf(Error);
      expect((fx.error as Error).message).toBe("graphragApiKey required when identity.doc_search configured");

      // 步骤 3：断言消息可判别、含建议动作，且无部分写入
      expect((fx.error as Error).message).toMatch(/required when identity\.doc_search configured/);
      expect(fx.runtime).toBeUndefined();
      expect(fx.facts).toEqual([]);

      // 步骤 4：断言内部错误不上抛为客户端码（G-UT-PI-2）
      expect((fx.error as { code?: unknown }).code).toBeUndefined();
    } finally {
      await fx.close();
    }
  });
});
