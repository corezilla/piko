/**
 * Case ID: UT-SCHED-033  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `−1 通过` 类（scheduler.ts:29）
 * 维度坐标：`release` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-033.md（脚本的唯一依据）
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

describe("UT-SCHED-033 · release · 数值/长度上限参数 × −1 通过", () => {
  it("returns false for an epoch below the current lease", () => {
    // 步骤 1：构造 Scheduler、排队并认领
    const { scheduler, store } = newScheduler();
    try {
      queueRun(store, "t-1");
      const grant = scheduler.acquire("owner") as { task_id: string; lease_epoch: number };

      // 步骤 2：调用 release(grant.task_id, grant.lease_epoch - 1)
      // 步骤 3：断言返回 false 且槽位未被清空
      expect(scheduler.release(grant.task_id, grant.lease_epoch - 1)).toBe(false);
      expect(scheduler.read().task_id).toBe(grant.task_id);
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
