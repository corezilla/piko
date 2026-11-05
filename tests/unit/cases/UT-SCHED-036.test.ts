/**
 * Case ID: UT-SCHED-036  ·  STATUS: real
 *
 * 责任：返回站点 L38 值 （scheduler.ts）
 * 维度坐标：`identity` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-036.md（脚本的唯一依据）
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

describe("UT-SCHED-036 · identity · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns a stable owner id and boot id", () => {
    // 步骤 1：构造 Scheduler
    const { scheduler, store } = newScheduler();
    try {
      // 步骤 2：读回 identity() 两次
      const first = scheduler.identity();
      const second = scheduler.identity();

      // 步骤 3：断言两次相同（同一进程内身份稳定），且 owner_id 与 boot_id 都非空
      expect(first).toEqual(second);
      expect(first.owner_id).toContain("inst-1");
      expect(first.boot_id).toBeTruthy();
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
