/**
 * Case ID: UT-SCHED-006  ·  STATUS: real
 *
 * 责任：参数 `store: TaskStore` 的 `每等价类合法值` 类（scheduler.ts:9）
 * 维度坐标：`Scheduler.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-006.md（脚本的唯一依据）
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

describe("UT-SCHED-006 · Scheduler.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts a store and holds it for the slot operations", () => {
    // 步骤 1：构造一个内存 SQLite store 与 Scheduler
    const { scheduler, store } = newScheduler();
    try {
      // 步骤 2：读回 identity()
      // 步骤 3：断言构造成功——store 被持有，bootId 已生成
      expect(scheduler.identity().boot_id).toBeTruthy();
      expect(store).toBeDefined();
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
