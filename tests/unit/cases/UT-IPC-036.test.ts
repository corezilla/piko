/**
 * Case ID: UT-IPC-036  ·  STATUS: real
 *
 * 责任：参数 `fact: Fact` 的 `每等价类合法值` 类（ipc.ts:144）
 * 维度坐标：`report` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-036.md（脚本的唯一依据）
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

describe("UT-IPC-036 · report · 纯函数/无副作用 × 每等价类合法值", () => {
  it("sends the fact with a correlation id", async () => {
    // 步骤 1：构造记录发送内容的 send
    const sent: { ipc: string; id: number; fact: Fact }[] = [];
    const channel = new ProcessChannel((msg) => { sent.push(msg as never); });

    // 步骤 2：report 一个 fact
    void channel.report({ kind: "heartbeat", at: 42 });

    // 步骤 3：断言消息结构完整（ipc/id/fact）
    expect(sent[0].ipc).toBe("fact");
    expect(sent[0].fact).toEqual({ kind: "heartbeat", at: 42 });
    expect(typeof sent[0].id).toBe("number");
  });
});
