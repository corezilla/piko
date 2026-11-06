/**
 * Case ID: UT-IPC-014  ·  STATUS: real
 *
 * 责任：参数 `handler` 的 `边界(上/下/零/空/满)` 类（ipc.ts:117）
 * 维度坐标：`LocalChannel.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-014.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { FactHandler, LocalChannel, type Fact } from "../../../src/ipc.js";
import { TaskStore } from "../../../src/store.js";
import type { TaskRequest } from "../../../src/types.js";

const task = (over: Partial<TaskRequest> = {}): TaskRequest => ({
  task_id: "t-1",
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: ["out/result.txt"],
  ...over,
} as TaskRequest);

/** 一个带一个排队任务的 store。 */
function newStore(): TaskStore {
  const store = new TaskStore(":memory:", 1000);
  store.createOrGet(task(), "slinky", 10, undefined);
  return store;
}

describe("UT-IPC-014 · LocalChannel.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("binds a handler over an empty store", async () => {
    // 步骤 1：构造空 store 与 channel
    const store = new TaskStore(":memory:", 1000);
    try {
      const channel = new LocalChannel(new FactHandler(store));

      // 步骤 2：report 一个 staging fact（store 里没有该任务）
      const outcome = await channel.report({ kind: "staging", task_id: "t-1", staging: { state: "ready", fetched: [], failed: [] } });

      // 步骤 3：断言返回失败（空 store 上没有这个任务）——
      //         事实未被提交，但也没有抛出
      expect(outcome.ok).toBe(false);
      expect(outcome.error).toBeDefined();
    } finally {
      store.close();
    }
  });
});
