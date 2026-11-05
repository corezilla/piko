/**
 * Case ID: UT-SCHED-005  ·  STATUS: real
 *
 * 责任：`renew` × `并发/可重入` × `并发对偶/交错`（波次一粗粒度登记）
 * 维度坐标：`renew` × `并发/可重入` × `并发对偶/交错`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-005.md（脚本的唯一依据）
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

describe("UT-SCHED-005 · renew · 并发/可重入 × 并发对偶/交错", () => {
  it("renews only for the current lease epoch", () => {
    // 步骤 1：构造 Scheduler、排队并认领
    const { scheduler, store } = newScheduler();
    try {
      queueRun(store, "t-1");
      const grant = scheduler.acquire("owner-a") as { task_id: string; lease_epoch: number };

      // 步骤 2：交错的两次续租——旧 epoch 与当前 epoch
      const stale = scheduler.renew(grant.task_id, grant.lease_epoch - 1);
      const current = scheduler.renew(grant.task_id, grant.lease_epoch);

      // 步骤 3：断言旧租约续租失败、当前租约成功
      expect(stale).toBe(false);
      expect(current).toBe(true);
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
