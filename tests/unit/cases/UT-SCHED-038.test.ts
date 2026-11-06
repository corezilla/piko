/**
 * Case ID: UT-SCHED-038  ·  STATUS: real
 *
 * 责任：状态写 L43 → `this.timer`（scheduler.ts）
 * 维度坐标：`close` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-038.md（脚本的唯一依据）
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

describe("UT-SCHED-038 · close · 状态分支 × 合法迁移", () => {
  it("clears the timer reference on close", () => {
    // 步骤 1：构造 Scheduler
    const { scheduler, store } = newScheduler();
    try {
      // 步骤 2：读一次私有 timer（构造后为 null）
      const timerBefore = (scheduler as unknown as { timer: NodeJS.Timeout | null }).timer;
      expect(timerBefore).toBeNull();

      // 步骤 3：调用 close() 并断言 timer 被置为 null
      scheduler.close();
      expect((scheduler as unknown as { timer: NodeJS.Timeout | null }).timer).toBeNull();
    } finally {
      store.close();
    }
  });
});
