/**
 * Case ID: UT-SCHED-022  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（scheduler.ts:25）
 * 维度坐标：`renew` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-022.md（脚本的唯一依据）
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

describe("UT-SCHED-022 · renew · 字符串/路径/枚举输入 × 超长", () => {
  it("returns false for an over-long task id", () => {
    // 步骤 1：构造 Scheduler
    const { scheduler, store } = newScheduler();
    try {
      // 步骤 2：调用 renew(超长串, 1)
      // 步骤 3：断言返回 false
      expect(scheduler.renew("t".repeat(1000), 1)).toBe(false);
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
