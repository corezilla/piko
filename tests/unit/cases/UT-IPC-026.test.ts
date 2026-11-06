/**
 * Case ID: UT-IPC-026  ·  STATUS: real
 *
 * 责任：参数 `onCommand` 的 `非法值` 类（ipc.ts:131）
 * 维度坐标：`ProcessChannel.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-026.md（脚本的唯一依据）
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

describe("UT-IPC-026 · ProcessChannel.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("does not invoke the command handler for a non-command message", () => {
    // 步骤 1：构造记录调用的 onCommand
    const commands: unknown[] = [];
    const channel = new ProcessChannel(() => {}, (cmd) => { commands.push(cmd); });

    // 步骤 2：发一条 ipc 为 "fact" 的消息
    (process.emit as (e: string, m: unknown) => boolean)("message", { ipc: "fact", id: 1, fact: { kind: "heartbeat", at: 1 } });

    // 步骤 3：断言命令回调未被调用
    expect(commands).toEqual([]);
    void channel;
  });
});
