/**
 * Case ID: UT-PI-282  ·  STATUS: real
 *
 * 责任：参数 `transfer: Transfer` 的 `每等价类合法值` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-282.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor } from "./support/pi-runtime-fix.js";

describe("UT-PI-282 · PiRuntime.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts the legal equivalent classes of the transfer parameter", async () => {  // accepts the legal equivalent classes of the transfer parameter
    // 步骤 1：每个等价类一个代表值 —— 有 transfer 对象 / 无 transfer
    const transfer = { id: "transfer-1" };
    for (const t of [transfer, undefined]) {
      const fx = await piConstructor({ transfer: t });
      try {
        // 步骤 2/3：断言被接受 —— 构造器只持有引用
        expect(fx.error).toBeUndefined();
        expect(fx.runtime).toBeDefined();
        expect(fx.state("transfer")).toBe(t);
      } finally {
        await fx.close();
      }
    }
  });
});
