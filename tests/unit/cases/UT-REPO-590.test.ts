/**
 * Case ID: UT-REPO-590  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `恰好通过` 类（store.ts:745）
 * 维度坐标：`publishResult` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-590.md（脚本的唯一依据）
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

describe("UT-REPO-590 · publishResult · 数值/长度上限参数 × 恰好通过", () => {

  it("accepts the exact lease epoch and writes the result generation", async () => {
    const store = newStore();
    try {
      accept(store, task("t-590"));
      const grant = store.tryClaimSlot("worker", "boot") as { task_id: string; lease_epoch: number };

      // 步骤 1：按 `恰好通过` 类构造参数 epoch——正好等于执行位当前持有的 lease_epoch
      // 步骤 2：调用 publishResult(…)
      store.publishResult(result("t-590"), grant.lease_epoch);

      // 步骤 3：断言逐值对账——结果行落库（generation=1），运行纪元 +1，运行仍未终态
      expect(store.db.prepare("SELECT task_id,generation FROM results").get()).toEqual({
        task_id: "t-590",
        generation: 1,
      });
      expect(store.generation("t-590")).toBe(2);
      expect(store.getRun("t-590").state).toBe("Running");
      expect(store.result("t-590").state).toBe("Completed");
    } finally {
      store.close();
    }
  });

});
