/**
 * Case ID: UT-PI-284  ·  STATUS: real
 *
 * 责任：参数 `transfer: Transfer` 的 `非法值` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-284.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor } from "./support/pi-runtime-fix.js";

describe("UT-PI-284 · PiRuntime.constructor · 纯函数/无副作用 × 非法值", () => {
  it("accepts the illegal-value class of the transfer parameter without throwing at construction time", async () => {  // accepts the illegal-value class of the transfer parameter without throwing at construction time
    // 步骤 1：非法值 —— 一个非 Transfer 的对象
    const bogus = { notATransfer: 42 };

    // 步骤 2：构造
    const fx = await piConstructor({ transfer: bogus });
    try {
      // 步骤 3：断言当前实况 —— 构造器不解引用 transfer 的方法，非法值在构造期不可观察
      expect(fx.error).toBeUndefined();
      expect(fx.state("transfer")).toBe(bogus);
    } finally {
      await fx.close();
    }
  });
});
