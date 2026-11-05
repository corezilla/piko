/**
 * Case ID: UT-SCHED-008  ·  STATUS: real
 *
 * 责任：参数 `store: TaskStore` 的 `非法值` 类（scheduler.ts:9）
 * 维度坐标：`Scheduler.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-008.md（脚本的唯一依据）
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

describe("UT-SCHED-008 · Scheduler.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("does not touch the store at construction time", () => {
    // 步骤 1：构造 Scheduler
    const { scheduler, store } = newScheduler();
    try {
      // 步骤 2：读回 slot 状态
      // 步骤 3：断言构造后 slot 仍未被占用（构造不产生副作用）
      const slot = scheduler.read();
      expect(slot.task_id).toBeNull();
      expect(slot.lease_epoch).toBe(0);
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
