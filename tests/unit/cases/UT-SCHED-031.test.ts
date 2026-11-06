/**
 * Case ID: UT-SCHED-031  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `恰好通过` 类（scheduler.ts:29）
 * 维度坐标：`release` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-031.md（脚本的唯一依据）
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

describe("UT-SCHED-031 · release · 数值/长度上限参数 × 恰好通过", () => {
  it("releases when the task id and the epoch match the slot", () => {
    // 步骤 1：构造 Scheduler、排队并认领
    const { scheduler, store } = newScheduler();
    try {
      queueRun(store, "t-1");
      const grant = scheduler.acquire("owner") as { task_id: string; lease_epoch: number };

      // 步骤 2：调用 release(grant.task_id, grant.lease_epoch)
      // 步骤 3：断言返回 true 且槽位被清空
      expect(scheduler.release(grant.task_id, grant.lease_epoch)).toBe(true);
      expect(scheduler.read().task_id).toBeNull();
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
