/**
 * Case ID: UT-IPC-021  ·  STATUS: real
 *
 * 责任：参数 `send: (msg: unknown) => void` 的 `每等价类合法值` 类（ipc.ts:131）
 * 维度坐标：`ProcessChannel.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-021.md（脚本的唯一依据）
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

describe("UT-IPC-021 · ProcessChannel.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("binds the send function and uses it for a fact", async () => {
    // 步骤 1：构造一个记录发送内容的 send 与 channel
    const sent: unknown[] = [];
    const channel = new ProcessChannel((msg) => { sent.push(msg); });

    // 步骤 2：report 一个 fact（不等待回复——send 不会回 outcome）
    const pending = channel.report({ kind: "heartbeat", at: 1 });

    // 步骤 3：断言消息被送出且带关联 id
    expect(sent).toHaveLength(1);
    expect((sent[0] as { ipc: string }).ipc).toBe("fact");
    expect(typeof (sent[0] as { id: number }).id).toBe("number");
    void pending;
  });
});
