/**
 * Case ID: UT-IPC-019  ·  STATUS: real
 *
 * 责任：await 拒绝传播（report 的 await 目标拒绝必须 typed 化上抛；ipc.ts:118）
 * 维度坐标：`report` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-019.md（脚本的唯一依据）
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

describe("UT-IPC-019 · report · 错误路径 × 每个 typed 错误码", () => {
  it("does not throw when the handler fails", async () => {
    // 步骤 1：构造空 store 与 channel
    const store = new TaskStore(":memory:", 1000);
    try {
      const channel = new LocalChannel(new FactHandler(store));

      // 步骤 2：report 一个指向未知任务的 staging fact —— store 抛 typed 错误
      // 步骤 3：断言返回失败而不是抛出——未提交的事实不得被当成已应用
      const outcome = await channel.report({ kind: "staging", task_id: "missing", staging: { state: "ready", fetched: [], failed: [] } });
      expect(outcome.ok).toBe(false);
      expect(outcome.error).toContain("staging reported for unknown task");
    } finally {
      store.close();
    }
  });
});
