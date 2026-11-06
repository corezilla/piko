/**
 * Case ID: UT-SCHED-034  ·  STATUS: real
 *
 * 责任：返回站点 L30 值 （scheduler.ts）
 * 维度坐标：`release` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-034.md（脚本的唯一依据）
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

describe("UT-SCHED-034 · release · 纯函数/无副作用 × 每等价类合法值", () => {
  it("clears the slot on a successful release and keeps the epoch", () => {
    // 步骤 1：构造 Scheduler、排队并认领
    const { scheduler, store } = newScheduler();
    try {
      queueRun(store, "t-1");
      const grant = scheduler.acquire("owner") as { task_id: string; lease_epoch: number };
      const epochBefore = scheduler.read().lease_epoch;

      // 步骤 2：调用 release
      const released = scheduler.release(grant.task_id, grant.lease_epoch);

      // 步骤 3：断言返回 true，槽位清空但 epoch 保留（epoch 只增不减）
      expect(released).toBe(true);
      const slot = scheduler.read();
      expect(slot.task_id).toBeNull();
      expect(slot.owner_id).toBeNull();
      expect(slot.lease_epoch).toBe(epochBefore);
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
