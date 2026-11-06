/**
 * Case ID: UT-SCHED-002  ·  STATUS: real
 *
 * 责任：`read` × `并发/可重入` × `并发对偶/交错`（波次一粗粒度登记）
 * 维度坐标：`read` × `并发/可重入` × `并发对偶/交错`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-002.md（脚本的唯一依据）
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

describe("UT-SCHED-002 · read · 并发/可重入 × 并发对偶/交错", () => {
  it("reads a coherent slot while an acquirer interleaves", () => {
    // 步骤 1：构造 Scheduler 并排队一个任务
    const { scheduler, store } = newScheduler();
    try {
      queueRun(store, "t-1");

      // 步骤 2：交错地认领与读取
      const grant = scheduler.acquire("owner-a") as { task_id: string; lease_epoch: number };
      const seen = scheduler.read();

      // 步骤 3：断言读到的是一个自洽快照（task_id 与 epoch 来自同一次认领）
      expect(seen.task_id).toBe(grant.task_id);
      expect(seen.lease_epoch).toBe(grant.lease_epoch);
      expect(seen.owner_id).toBe("owner-a");
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
