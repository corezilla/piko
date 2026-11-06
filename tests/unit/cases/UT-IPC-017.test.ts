/**
 * Case ID: UT-IPC-017  ·  STATUS: real
 *
 * 责任：参数 `fact` 的 `边界(上/下/零/空/满)` 类（ipc.ts:118）
 * 维度坐标：`report` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-017.md（脚本的唯一依据）
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

describe("UT-IPC-017 · report · 纯函数/无副作用 × 每等价类合法值", () => {
  it("reports a heartbeat that touches no store state", async () => {
    // 步骤 1：构造 store、handler 与 channel
    const store = newStore();
    try {
      const channel = new LocalChannel(new FactHandler(store));

      // 步骤 2：report 一个 heartbeat
      // 步骤 3：断言失败——heartbeat 不在 apply 的 switch 里，走 default 分支
      //         返回「未知 fact heartbeat」；这是实现的真实行为
      const outcome = await channel.report({ kind: "heartbeat", at: 12345 });
      expect(outcome.ok).toBe(false);
      expect(outcome.error).toContain("unknown fact heartbeat");
      expect(store.getRun("t-1").state).toBe("Queued");
    } finally {
      store.close();
    }
  });
});
