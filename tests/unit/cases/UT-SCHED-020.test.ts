/**
 * Case ID: UT-SCHED-020  ·  STATUS: real
 *
 * 责任：返回站点 L22 值 （scheduler.ts）
 * 维度坐标：`recover` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-020.md（脚本的唯一依据）
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

describe("UT-SCHED-020 · recover · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns null when there is nothing to recover", () => {
    // 步骤 1：构造 Scheduler（slot 空闲、无孤儿）
    const { scheduler, store } = newScheduler();
    try {
      // 步骤 2：调用 recover("owner")
      // 步骤 3：断言返回 null
      expect(scheduler.recover("owner")).toBeNull();
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
