/**
 * Case ID: UT-PI-283  ·  STATUS: real
 *
 * 责任：参数 `transfer: Transfer` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-283.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor } from "./support/pi-runtime-fix.js";

describe("UT-PI-283 · PiRuntime.constructor · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts the boundary values of the transfer parameter", async () => {  // accepts the boundary values of the transfer parameter
    // 步骤 1：边界 —— 空对象 / 缺字段的对象
    for (const t of [{}, { id: "" }]) {
      const fx = await piConstructor({ transfer: t });
      try {
        // 步骤 2/3：断言被接受，transfer 原样持有
        expect(fx.error).toBeUndefined();
        expect(fx.state("transfer")).toBe(t);
      } finally {
        await fx.close();
      }
    }
  });
});
