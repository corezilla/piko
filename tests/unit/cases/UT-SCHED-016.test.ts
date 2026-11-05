/**
 * Case ID: UT-SCHED-016  ·  STATUS: real
 *
 * 责任：返回站点 L17 值 （scheduler.ts）
 * 维度坐标：`acquire` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-016.md（脚本的唯一依据）
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

describe("UT-SCHED-016 · acquire · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the grant on the non-busy side", () => {
    // 步骤 1：构造一个已排队的 Run
    const { scheduler, store } = newScheduler();
    try {
      // 造一个 Queued 且 input_staging_json.state 为 none 的 run（用 store 的公开 API）
      const created = store.createOrGet({
        task_id: "t-1",
        instruction: "do it",
        workspace_ref: "piko",
        permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
        output_paths: [],
      }, "slinky", 10, undefined);

      // 步骤 2：调用 acquire("owner")
      const grant = scheduler.acquire("owner");

      // 步骤 3：断言返回认领凭据（task_id 与 lease_epoch）
      expect(grant).not.toBeNull();
      expect((grant as { task_id: string }).task_id).toBe(created.task_id);
      expect((grant as { lease_epoch: number }).lease_epoch).toBeGreaterThan(0);
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
