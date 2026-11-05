/**
 * Case ID: UT-SCHED-019  ·  STATUS: real
 *
 * 责任：参数 `owner: string` 的 `注入字符` 类（scheduler.ts:21）
 * 维度坐标：`recover` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-019.md（脚本的唯一依据）
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

describe("UT-SCHED-019 · recover · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected owner name as data", () => {
    // 步骤 1：构造 Scheduler
    const { scheduler, store } = newScheduler();
    try {
      // 步骤 2：调用 recover(注入串)
      // 步骤 3：断言不抛错、不执行
      expect(scheduler.recover("$(id); rm -rf /")).toBeNull();
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
