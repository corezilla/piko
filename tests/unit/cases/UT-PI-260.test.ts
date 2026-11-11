/**
 * Case ID: UT-PI-260  ·  STATUS: real
 *
 * 责任：参数 `config: RuntimeConfig` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-260.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-260 · PiRuntime.constructor · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts the boundary values of the config parameter", async () => {  // accepts the boundary values of the config parameter
    // 步骤 1：边界取值 —— 空 roots、空 identity、零/空字符串的 base_url
    const configs = [
      piConfig({ workspace: { roots: {}, staging_root: "" } }),
      piConfig({ llmtier: { base_url: "", api_key_secret_ref: "env:PIKO_LLM_API_KEY", models_timeout_ms: 0 } }),
      piConfig({ identity: piIdentity({ role: "", name: "" }) }),
    ];

    // 步骤 2：逐个构造
    for (const config of configs) {
      const fx = await piConstructor({ config });
      try {
        // 步骤 3：断言被接受（边界不等于拒绝）
        expect(fx.error).toBeUndefined();
        expect(fx.runtime).toBeDefined();
      } finally {
        await fx.close();
      }
    }
  });
});
