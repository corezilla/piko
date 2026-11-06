/**
 * Case ID: UT-IPC-093  ·  STATUS: real
 *
 * 责任：返回站点 L85 值 （ipc.ts）
 * 维度坐标：`apply` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-093.md（脚本的唯一依据）
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

describe("UT-IPC-093 · apply · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns ok for a finish fact", () => {
    const store = newStore();
    try {
      const handler = new FactHandler(store);
      // 先认领槽位，拿到真实的 lease_epoch——这两个 fact 按 epoch 围栏
      const claim = handler.apply({ kind: "claim", owner: "owner-a", boot: "boot-1" });
      const epoch = (claim.value as { lease_epoch: number }).lease_epoch;
      const outcome = handler.apply({
        kind: "finish",
        result: { task_id: "t-1", generation: 1, state: "Completed", partial: false, failure: null, usage: USAGE as never, published_at: "2026-11-05T00:00:00.000Z" } as never,
        lease_epoch: epoch,
      });
      expect(outcome.ok).toBe(true);
    } finally {
      store.close();
    }
  });});
