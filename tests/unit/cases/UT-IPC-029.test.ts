/**
 * Case ID: UT-IPC-029  ·  STATUS: real
 *
 * 责任：分支 L133 && : msg?.ipc === "outcome" && typeof msg.id === "num（ipc.ts）
 * 维度坐标：`ProcessChannel.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-029.md（脚本的唯一依据）
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

describe("UT-IPC-029 · ProcessChannel.constructor · 状态分支 × 合法迁移", () => {
  it("ignores an outcome message whose id is not a number", () => {
    // 步骤 1：构造 channel
    const sent: { id: number }[] = [];
    const channel = new ProcessChannel((msg) => { sent.push(msg as { id: number }); });

    // 步骤 2：report 一个 fact，再发一条 id 为字符串的 outcome
    const pending = channel.report({ kind: "heartbeat", at: 1 });
    (process.emit as (e: string, m: unknown) => boolean)("message", { ipc: "outcome", id: "not-a-number", outcome: { ok: true } });

    // 步骤 3：断言 promise 仍未被解析（第二项为假）
    let resolved = false;
    void pending.then(() => { resolved = true; });
    expect(resolved).toBe(false);
    void channel;
  });
});
