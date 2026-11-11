/**
 * Case ID: UT-PI-268  ·  STATUS: real
 *
 * 责任：参数 `channel: Channel` 的 `每等价类合法值` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-268.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor } from "./support/pi-runtime-fix.js";

describe("UT-PI-268 · PiRuntime.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts the legal equivalent classes of the channel parameter", async () => {  // accepts the legal equivalent classes of the channel parameter
    // 步骤 1：每个等价类一个代表值 —— 记录型 channel（构造期不发事实）
    const fx = await piConstructor();
    try {
      // 步骤 2/3：断言被接受，且构造期不产生任何事实
      expect(fx.error).toBeUndefined();
      expect(fx.runtime).toBeDefined();
      expect(fx.facts).toEqual([]);
    } finally {
      await fx.close();
    }
  });
});
