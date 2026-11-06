/**
 * Case ID: UT-SCHED-001  ·  STATUS: real
 *
 * 责任：`acquire` × `并发/可重入` × `并发对偶/交错`（波次一粗粒度登记）
 * 维度坐标：`acquire` × `并发/可重入` × `并发对偶/交错`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-001.md（脚本的唯一依据）
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
  return (created as { task_id: string }).task_id;
}

describe("UT-SCHED-001 · acquire · 并发/可重入 × 并发对偶/交错", () => {
  it("grants the slot to exactly one of two interleaved acquirers", () => {
    // 步骤 1：构造 Scheduler 并排队一个任务（只有一个可认领的目标）
    const { scheduler, store } = newScheduler();
    try {
      queueRun(store, "t-1");

      // 步骤 2：交错地让两个持有者各认领一次
      const first = scheduler.acquire("owner-a");
      const second = scheduler.acquire("owner-b");

      // 步骤 3：断言只有一个拿到凭据（单槽位语义），另一个拿到 null
      const granted = [first, second].filter((g) => g !== null);
      expect(granted).toHaveLength(1);
      expect((granted[0] as { task_id: string }).task_id).toBe("t-1");
    } finally {
      scheduler.close();
      store.close();
    }
  });

  it("does not let a second acquirer steal the slot with a different epoch", () => {
    // 步骤 1：构造 Scheduler 并排队一个任务
    const { scheduler, store } = newScheduler();
    try {
      queueRun(store, "t-1");

      // 步骤 2：先后认领两次
      const first = scheduler.acquire("owner-a") as { lease_epoch: number };
      const second = scheduler.acquire("owner-b");

      // 步骤 3：断言第二次为 null，且槽位仍归第一个持有者
      expect(second).toBeNull();
      expect(scheduler.read().owner_id).toBe("owner-a");
      expect(scheduler.read().lease_epoch).toBe(first.lease_epoch);
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
