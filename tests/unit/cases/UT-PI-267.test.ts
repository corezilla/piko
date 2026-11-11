/**
 * Case ID: UT-PI-267  ·  STATUS: real
 *
 * 责任：参数 `store: TaskStore` 的 `非法值` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-267.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor } from "./support/pi-runtime-fix.js";
import { TaskStore } from "../../../src/store.js";

describe("UT-PI-267 · PiRuntime.constructor · 纯函数/无副作用 × 非法值", () => {
  it("accepts the illegal-value class of the store parameter without throwing at construction time", async () => {  // accepts the illegal-value class of the store parameter without throwing at construction time
    // 步骤 1：非法值 —— 一个不是 TaskStore 的对象（缺 pendingTurns 等方法）
    const bogus = { notAStore: true } as unknown as TaskStore;

    // 步骤 2：用它构造
    const fx = await piConstructor({ store: bogus });
    try {
      // 步骤 3：断言当前实况 —— 构造器只持有引用、不解引用 store 的方法，
      // 故非法 store 在构造期不可观察（到 execute 才炸）
      expect(fx.error).toBeUndefined();
      expect(fx.runtime).toBeDefined();
      expect(fx.facts).toEqual([]);
    } finally {
      await fx.close();
    }
  });
});
