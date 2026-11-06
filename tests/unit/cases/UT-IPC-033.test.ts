/**
 * Case ID: UT-IPC-033  ·  STATUS: real
 *
 * 责任：分支 L141 && : msg?.ipc === "command" && onCommand（ipc.ts）
 * 维度坐标：`ProcessChannel.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-033.md（脚本的唯一依据）
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

describe("UT-IPC-033 · ProcessChannel.constructor · 状态分支 × 合法迁移", () => {
  it("ignores a command message when the handler is absent", () => {
    // 步骤 1：构造不带 onCommand 的 channel
    const channel = new ProcessChannel(() => {});

    // 步骤 2：发一条 command 消息
    // 步骤 3：断言不抛错（第二项为假）
    expect(() => (process.emit as (e: string, m: unknown) => boolean)("message", { ipc: "command", command: { kind: "dispatch" } })).not.toThrow();
    void channel;
  });
});
