/**
 * Case ID: UT-SCHED-027  ·  STATUS: real
 *
 * 责任：返回站点 L26 值 （scheduler.ts）
 * 维度坐标：`renew` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-027.md（脚本的唯一依据）
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

/** 造一个排队中的任务，返回其 task_id。 */
function queueRun(store: TaskStore, taskId: string): string {
  const created = store.createOrGet({
    task_id: taskId,
    instruction: "do it",
    workspace_ref: "piko",
    permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
    output_paths: [],
  }, "slinky", 10, undefined);
  return (created as { task_id: string }).task_id;
}

describe("UT-SCHED-027 · renew · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns a boolean and does not change the lease epoch", () => {
    // 步骤 1：构造 Scheduler、排队并认领
    const { scheduler, store } = newScheduler();
    try {
      queueRun(store, "t-1");
      const grant = scheduler.acquire("owner") as { task_id: string; lease_epoch: number };
      const before = scheduler.read().lease_epoch;

      // 步骤 2：调用 renew 成功一次
      const renewed = scheduler.renew(grant.task_id, grant.lease_epoch);

      // 步骤 3：断言返回 true，且租约 epoch 不变（续租不改 epoch）
      expect(renewed).toBe(true);
      expect(scheduler.read().lease_epoch).toBe(before);
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
