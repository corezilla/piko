/**
 * Case ID: UT-PI-269  ·  STATUS: real
 *
 * 责任：参数 `channel: Channel` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-269.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor } from "./support/pi-runtime-fix.js";

describe("UT-PI-269 · PiRuntime.constructor · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts the boundary values of the channel parameter", async () => {  // accepts the boundary values of the channel parameter
    // 步骤 1：边界 —— 空事实列表的 channel（构造期无人上报）
    const fx = await piConstructor();
    try {
      // 步骤 2/3：断言被接受，事实列表仍为空
      expect(fx.error).toBeUndefined();
      expect(fx.facts).toEqual([]);
    } finally {
      await fx.close();
    }
  });
});
