/**
 * Case ID: UT-SCHED-007  ·  STATUS: real
 *
 * 责任：参数 `store: TaskStore` 的 `边界(上/下/零/空/满)` 类（scheduler.ts:9）
 * 维度坐标：`Scheduler.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-007.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Scheduler } from "../../../src/scheduler.js";
import { TaskStore } from "../../../src/store.js";
import type { RuntimeConfig } from "../../../src/types.js";

const config = { instance_id: "inst-1" } as unknown as RuntimeConfig;

function newScheduler(): { scheduler: Scheduler; store: TaskStore } {
  const store = new TaskStore(":memory:", 1000);
  return { scheduler: new Scheduler(store, config), store };
}

describe("UT-SCHED-007 · Scheduler.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("generates a distinct boot id per scheduler", () => {
    // 步骤 1：构造两个 Scheduler
    const a = newScheduler();
    const b = newScheduler();
    try {
      // 步骤 2：读回两者的 identity()
      // 步骤 3：断言 boot_id 不同（每次构造都是新的一次启动）
      expect(a.scheduler.identity().boot_id).not.toBe(b.scheduler.identity().boot_id);
    } finally {
      a.scheduler.close();
      a.store.close();
      b.scheduler.close();
      b.store.close();
    }
  });
});
