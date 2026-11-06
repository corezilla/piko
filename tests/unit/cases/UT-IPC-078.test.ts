/**
 * Case ID: UT-IPC-078  ·  STATUS: real
 *
 * 责任：分支 L98 if : if (grant === "slot_busy")（ipc.ts）
 * 维度坐标：`apply` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-078.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { FactHandler, type Fact } from "../../../src/ipc.js";
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

function newStore(): TaskStore {
  const store = new TaskStore(":memory:", 1000);
  store.createOrGet(task(), "slinky", 10, undefined);
  return store;
}

describe("UT-IPC-078 · apply · 状态分支 × 合法迁移", () => {
  it("returns null when the slot is busy", () => {
    // 步骤 1：构造 store 与 handler，并先占住槽位
    const store = newStore();
    try {
      const handler = new FactHandler(store);
      handler.apply({ kind: "claim", owner: "owner-a", boot: "boot-1" });

      // 步骤 2：再 apply 一个 claim fact
      const outcome = handler.apply({ kind: "claim", owner: "owner-b", boot: "boot-2" });

      // 步骤 3：断言 value 为 null（槽位已被占用）
      expect(outcome.ok).toBe(true);
      expect(outcome.value).toBeNull();
    } finally {
      store.close();
    }
  });
});
