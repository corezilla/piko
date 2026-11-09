/**
 * Case ID: UT-REPO-301  ·  STATUS: real
 *
 * 责任：分支 L469 `if (ex)`（if；store.ts）
 * 维度坐标：`reserveTool` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-301.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { TaskStore, asReader } from "../../../src/store.js";
import {
  accept,
  acceptDiscussion,
  discussionTask,
  newStore,
  rawUsageSample,
  result,
  task,
} from "./support/repo-fix.js";
import type { AgentResult } from "../../../src/types.js";

describe("UT-REPO-301 · reserveTool · 状态分支 × 合法迁移", () => {

  it("blocks an unsafe replay and admits a safe replay of the same tool call", async () => {
    const store = newStore();
    try {
      accept(store, task("t-301"));
      expect(store.reserveTool("t-301", "op-301", "id-never", "tool", "effect", "never")).toBe("Admitted");
      expect(store.reserveTool("t-301", "op-301", "id-safe", "tool", "effect", "safe")).toBe("Admitted");

      // 步骤 1：构造使 store.ts:469 的分支（if：`if (ex)`）取真的输入——同一 tool_call_id 已存在
      // 步骤 2：调用 reserveTool(…) 并断言该侧可观测结果
      const unsafe = store.reserveTool("t-301", "op-301", "id-never", "tool", "effect", "never");

      // 步骤 3：构造使该分支取假的输入——同一 tool_call_id 不存在
      // 步骤 4：再次调用 reserveTool(…) 并断言取假侧结果（两侧都被观测到）
      const fresh = store.reserveTool("t-301", "op-301", "id-fresh", "tool", "effect", "never");
      // 同一个已存在的 safe 行再重放一次：走 ex 分支但 replay='safe'，仍返回 Admitted
      const safeReplay = store.reserveTool("t-301", "op-301", "id-safe", "tool", "effect", "safe");

      expect(unsafe).toBe("UnsafeRetryBlocked");
      expect(fresh).toBe("Admitted");
      expect(safeReplay).toBe("Admitted");
      // 重放分支的两侧副作用不同：unsafe 不动计数与 recovery_count，safe 才推 recovery_count
      const rows = store.db.prepare(
        "SELECT tool_call_id,replay,recovery_count,state FROM tool_calls ORDER BY tool_call_id",
      ).all() as any[];
      expect(rows).toEqual([
        { tool_call_id: "id-fresh", replay: "never", recovery_count: 0, state: "Reserved" },
        { tool_call_id: "id-never", replay: "never", recovery_count: 0, state: "Reserved" },
        { tool_call_id: "id-safe", replay: "safe", recovery_count: 1, state: "Reserved" },
      ]);
      expect(store.getRun("t-301").progress.tool_calls).toBe(3);
    } finally {
      store.close();
    }
  });

});
