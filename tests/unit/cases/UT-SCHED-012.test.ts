/**
 * Case ID: UT-SCHED-012  ·  STATUS: real
 *
 * 责任：参数 `owner: string` 的 `空` 类（scheduler.ts:15）
 * 维度坐标：`acquire` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-012.md（脚本的唯一依据）
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

describe("UT-SCHED-012 · acquire · 字符串/路径/枚举输入 × 空", () => {
  it("returns null for an empty owner when no run is queued", () => {
    // 步骤 1：构造 Scheduler（无排队任务）
    const { scheduler, store } = newScheduler();
    try {
      // 步骤 2：调用 acquire("")
      // 步骤 3：断言返回 null（无可认领的 Queued Run）
      expect(scheduler.acquire("")).toBeNull();
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
