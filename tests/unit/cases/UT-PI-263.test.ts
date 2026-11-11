/**
 * Case ID: UT-PI-263  ·  STATUS: real
 *
 * 责任：参数 `registry: ToolRegistry` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-263.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-263 · PiRuntime.constructor · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts the boundary values of the registry parameter", async () => {  // accepts the boundary values of the registry parameter
    // 步骤 1：边界 —— 空 profiles 表、空 tools 表、空 recovery_contracts
    const registries = [
      piTools({}, { profiles: {} } as never),
      piTools({ "workspace-standard": {} }, { recovery_contracts: {} } as never),
    ];

    // 步骤 2：逐个构造
    for (const registry of registries) {
      const fx = await piConstructor({ registry });
      try {
        // 步骤 3：断言被接受
        expect(fx.error).toBeUndefined();
        expect(fx.runtime).toBeDefined();
      } finally {
        await fx.close();
      }
    }
  });
});
