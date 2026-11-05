/**
 * Case ID: UT-SCHED-035  ·  STATUS: real
 *
 * 责任：返回站点 L34 值 （scheduler.ts）
 * 维度坐标：`read` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-035.md（脚本的唯一依据）
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
  return created.task_id;
}

describe("UT-SCHED-035 · read · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the slot state and reflects an acquisition", () => {
    // 步骤 1：构造 Scheduler 并读一次空闲槽位
    const { scheduler, store } = newScheduler();
    try {
      const before = scheduler.read();
      expect(before.task_id).toBeNull();
      expect(before.lease_epoch).toBe(0);

      // 步骤 2：排队并认领，再读一次
      queueRun(store, "t-1");
      const grant = scheduler.acquire("owner") as { task_id: string; lease_epoch: number };
      const after = scheduler.read();

      // 步骤 3：断言读到的是权威事实源（task_id/owner/epoch 与认领结果一致）
      expect(after.task_id).toBe(grant.task_id);
      expect(after.owner_id).toBe("owner");
      expect(after.lease_epoch).toBe(grant.lease_epoch);
      expect(after.boot_id).toBe(scheduler.identity().boot_id);
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
