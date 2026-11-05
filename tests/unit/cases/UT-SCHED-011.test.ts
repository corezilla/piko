/**
 * Case ID: UT-SCHED-011  ·  STATUS: real
 *
 * 责任：参数 `config: RuntimeConfig` 的 `非法值` 类（scheduler.ts:9）
 * 维度坐标：`Scheduler.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `SCHED`）
 * 用例文档：docs/70_verification/unit/cases/UT-SCHED-011.md（脚本的唯一依据）
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

describe("UT-SCHED-011 · Scheduler.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("reads the instance id only when identity() is called", () => {
    // 步骤 1：构造一个没有 instance_id 的 config
    const store = new TaskStore(":memory:", 1000);
    const scheduler = new Scheduler(store, {} as unknown as RuntimeConfig);
    try {
      // 步骤 2：读回 identity()
      // 步骤 3：断言 owner_id 变成 "undefined:主机名"（该参数无校验）
      expect(scheduler.identity().owner_id.startsWith("undefined:")).toBe(true);
    } finally {
      scheduler.close();
      store.close();
    }
  });
});
