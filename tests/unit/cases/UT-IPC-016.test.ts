/**
 * Case ID: UT-IPC-016  ·  STATUS: real
 *
 * 责任：参数 `fact: Fact` 的 `每等价类合法值` 类（ipc.ts:118）
 * 维度坐标：`report` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-016.md（脚本的唯一依据）
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

describe("UT-IPC-016 · report · 纯函数/无副作用 × 每等价类合法值", () => {
  it("reports a fact and returns the handler outcome", async () => {
    // 步骤 1：构造 store、handler 与 channel
    const store = newStore();
    try {
      const channel = new LocalChannel(new FactHandler(store));

      // 步骤 2：report 一个 delivery fact
      const outcome = await channel.report({ kind: "delivery", task_id: "t-1", delivery: { state: "none", delivered: [], failed: [] } });

      // 步骤 3：断言成功且副作用落库
      expect(outcome.ok).toBe(true);
      expect(store.getRun("t-1").artifact_delivery.state).toBe("none");
    } finally {
      store.close();
    }
  });
});
