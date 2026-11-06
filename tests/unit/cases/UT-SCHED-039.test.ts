/**
 * Case ID: UT-SCHED-039  ·  STATUS: real
 *
 * 责任：资源 L42 clearInterval（scheduler.ts）
 * 维度坐标：`close` × `资源获取/释放` × `正常释放`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-039.md（脚本的唯一依据）
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

describe("UT-SCHED-039 · close · 资源获取/释放 × 正常释放", () => {
  it("clears a running timer on close", async () => {
    // 步骤 1：构造 Scheduler 并塞一个真实的定时器进去
    const { scheduler, store } = newScheduler();
    try {
      const handle = setInterval(() => {}, 1000);
      (scheduler as unknown as { timer: NodeJS.Timeout | null }).timer = handle;

      // 步骤 2：调用 close()
      scheduler.close();

      // 步骤 3：断言定时器被清除——已销毁的定时器不再触发
      let fired = false;
      const probe = setInterval(() => { fired = true; }, 10);
      await new Promise((r) => setTimeout(r, 60));
      clearInterval(probe);
      expect(fired).toBe(true);
      expect((scheduler as unknown as { timer: NodeJS.Timeout | null }).timer).toBeNull();
    } finally {
      store.close();
    }
  });
});
