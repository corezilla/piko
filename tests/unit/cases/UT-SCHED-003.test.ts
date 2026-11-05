/**
 * Case ID: UT-SCHED-003  ·  STATUS: real
 *
 * 责任：`recover` × `状态分支` × `合法迁移`（波次一粗粒度登记）
 * 维度坐标：`recover` × `状态分支` × `合法迁移`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-003.md（脚本的唯一依据）
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

describe("UT-SCHED-003 · recover · 状态分支 × 合法迁移", () => {
  it("returns null when the slot holds no orphaned run", () => {
    // 步骤 1：构造 Scheduler（slot 空闲）
    const { scheduler, store } = newScheduler();
    try {
      // 步骤 2：调用 recover("owner")
      // 步骤 3：断言返回 null（无可回收项）
      expect(scheduler.recover("owner")).toBeNull();
    } finally {
      scheduler.close();
      store.close();
    }
  });

  it("takes over a running slot when the task is not terminal", () => {
    // 步骤 1：构造 Scheduler、排队并认领（槽位被占、Run 处于 Running）
    const { scheduler, store } = newScheduler();
    try {
      const taskId = queueRun(store, "t-1");
      const first = scheduler.acquire("owner-a") as { task_id: string; lease_epoch: number };
      (store as unknown as { mutateRun(cmd: unknown): number }).mutateRun({
        task_id: taskId,
        expected_generation: 1,
        expected_state_in: ["Running", "Queued"],
        mutation: () => {},
      });

      // 步骤 2：调用 recover("owner-b") —— 新进程接管孤儿租约
      const recovered = scheduler.recover("owner-b");

      // 步骤 3：断言拿到凭据且 epoch 递增（fencing 生效）
      expect(recovered).not.toBeNull();
      expect((recovered as { lease_epoch: number }).lease_epoch).toBeGreaterThan(first.lease_epoch);
      expect(scheduler.read().owner_id).toBe("owner-b");
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
