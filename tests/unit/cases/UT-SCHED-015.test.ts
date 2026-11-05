/**
 * Case ID: UT-SCHED-015  ·  STATUS: real
 *
 * 责任：分支 L17 ternary : ? granted === "slot_busy" :（scheduler.ts）
 * 维度坐标：`acquire` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-015.md（脚本的唯一依据）
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

describe("UT-SCHED-015 · acquire · 状态分支 × 合法迁移", () => {
  it("returns null on the slot_busy side", () => {
    // 步骤 1：构造 Scheduler（无排队任务 → tryClaimSlot 返回 slot_busy）
    const { scheduler, store } = newScheduler();
    try {
      // 步骤 2：调用 acquire("owner")
      // 步骤 3：断言返回 null（真值侧）
      expect(scheduler.acquire("owner")).toBeNull();
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
