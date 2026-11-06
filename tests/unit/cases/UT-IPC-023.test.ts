/**
 * Case ID: UT-IPC-023  ·  STATUS: real
 *
 * 责任：参数 `send` 的 `非法值` 类（ipc.ts:131）
 * 维度坐标：`ProcessChannel.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-023.md（脚本的唯一依据）
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

describe("UT-IPC-023 · ProcessChannel.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("does not throw when the send function throws", async () => {
    // 步骤 1：构造一个会抛错的 send
    const channel = new ProcessChannel(() => { throw new Error("pipe closed"); });

    // 步骤 2：report 一个 fact —— 抛出发生在 promise 构造器内
    // 步骤 3：断言 promise 被拒绝（传输错误不得被当成已提交）
    await expect(channel.report({ kind: "heartbeat", at: 1 })).rejects.toThrow(/pipe closed/);
  });
});
