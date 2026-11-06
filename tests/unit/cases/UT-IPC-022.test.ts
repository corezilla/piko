/**
 * Case ID: UT-IPC-022  ·  STATUS: real
 *
 * 责任：参数 `send` 的 `边界(上/下/零/空/满)` 类（ipc.ts:131）
 * 维度坐标：`ProcessChannel.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-022.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { FactHandler, ProcessChannel, attachChildToHandler, type Fact } from "../../../src/ipc.js";
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

const USAGE = {
  source: "PiModelResponses", quality: "Complete",
  input_tokens: 0, output_tokens: 0, total_tokens: 0,
  cache_read_tokens: 0, cache_write_tokens: 0, reasoning_tokens: 0,
  model_attempts: 0, usage_observed_attempts: 0, missing_fields: [],
};

function newStore(): TaskStore {
  const store = new TaskStore(":memory:", 1000);
  store.createOrGet(task(), "slinky", 10, undefined);
  return store;
}

describe("UT-IPC-022 · ProcessChannel.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("numbers each report with an increasing id", async () => {
    // 步骤 1：构造记录 id 的 send
    const ids: number[] = [];
    const channel = new ProcessChannel((msg) => { ids.push((msg as { id: number }).id); });

    // 步骤 2：连续 report 两个 fact
    void channel.report({ kind: "heartbeat", at: 1 });
    void channel.report({ kind: "heartbeat", at: 2 });

    // 步骤 3：断言 id 递增
    expect(ids).toHaveLength(2);
    expect(ids[1]).toBeGreaterThan(ids[0]);
  });
});
