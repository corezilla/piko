/**
 * Case ID: UT-PI-265  ·  STATUS: real
 *
 * 责任：参数 `store: TaskStore` 的 `每等价类合法值` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-265.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor } from "./support/pi-runtime-fix.js";
import { TaskStore } from "../../../src/store.js";

describe("UT-PI-265 · PiRuntime.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts the legal equivalent classes of the store parameter", async () => {  // accepts the legal equivalent classes of the store parameter
    // 步骤 1：每个等价类一个代表值 —— 空库、已有 task 的库
    const empty = new TaskStore(":memory:", 1000);
    const seeded = new TaskStore(":memory:", 1000);
    seeded.createOrGet(
      { task_id: "t-1", instruction: "go", workspace_ref: "piko", permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" }, output_paths: [] },
      "slinky",
      10,
    );

    // 步骤 2：逐个用该 store 构造
    for (const store of [empty, seeded]) {
      const fx = await piConstructor({ store });
      try {
        // 步骤 3：断言被接受 —— 构造器不读 store，只持有引用
        expect(fx.error).toBeUndefined();
        expect(fx.runtime).toBeDefined();
        expect(fx.facts).toEqual([]);
      } finally {
        await fx.close();
      }
    }
    empty.close();
    seeded.close();
  });
});
