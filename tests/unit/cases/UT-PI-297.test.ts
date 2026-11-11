/**
 * Case ID: UT-PI-297  ·  STATUS: real
 *
 * 责任：分支 L135 `if (config.identity?.doc_search && !gra…`（else；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `每个非法迁移拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-297.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-297 · PiRuntime.constructor · 状态分支 × 每个非法迁移拒绝", () => {
  it("rejects the illegal transition of configuring doc_search without a key", async () => {  // rejects the illegal transition of configuring doc_search without a key
    // 步骤 1：非法迁移 —— 配了 identity.doc_search 却没给 graphragApiKey
    const fx = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY", base_url: "https://graphrag.example.com" } } }),
    });
    try {
      // 步骤 2/3：断言迁移被拒绝，且无部分写入
      expect(fx.error).toBeInstanceOf(Error);
      expect((fx.error as Error).message).toBe("graphragApiKey required when identity.doc_search configured");
      expect(fx.runtime).toBeUndefined();
      expect(fx.facts).toEqual([]);
    } finally {
      await fx.close();
    }
  });
});
