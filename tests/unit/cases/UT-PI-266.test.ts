/**
 * Case ID: UT-PI-266  ·  STATUS: real
 *
 * 责任：参数 `store: TaskStore` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-266.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor } from "./support/pi-runtime-fix.js";
import { TaskStore } from "../../../src/store.js";

describe("UT-PI-266 · PiRuntime.constructor · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts the boundary values of the store parameter", async () => {  // accepts the boundary values of the store parameter
    // 步骤 1：边界 —— 容量为 0 的 store（任何 run 都排队不进去）
    const store = new TaskStore(":memory:", 0);

    // 步骤 2：用该 store 构造
    const fx = await piConstructor({ store });
    try {
      // 步骤 3：断言被接受 —— 构造器不碰 store，容量边界在 createOrGet 才生效
      expect(fx.error).toBeUndefined();
      expect(fx.runtime).toBeDefined();
    } finally {
      await fx.close();
    }
    store.close();
  });
});
