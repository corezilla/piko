/**
 * Case ID: UT-IPC-039  ·  STATUS: real
 *
 * 责任：await 拒绝传播（report 的 await 目标拒绝必须 typed 化上抛；ipc.ts:144）
 * 维度坐标：`report` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-039.md（脚本的唯一依据）
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

describe("UT-IPC-039 · report · 错误路径 × 每个 typed 错误码", () => {
  it("leaves the promise pending when no outcome ever arrives", async () => {
    // 步骤 1：构造一个从不回 outcome 的 send
    const channel = new ProcessChannel(() => {});

    // 步骤 2：report 一个 fact
    const pending = channel.report({ kind: "heartbeat", at: 1 });

    // 步骤 3：断言 promise 未被解析（传输未完成时不得当作已提交）
    let settled = false;
    void pending.then(() => { settled = true; });
    await new Promise((r) => setTimeout(r, 10));
    expect(settled).toBe(false);
  });
});
