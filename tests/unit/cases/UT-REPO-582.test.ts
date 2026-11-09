/**
 * Case ID: UT-REPO-582  ·  STATUS: real
 *
 * 责任：参数 `result: AgentResult` 的 `每等价类合法值` 类（store.ts:737）
 * 维度坐标：`insertResult` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-582.md（脚本的唯一依据）
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

describe("UT-REPO-582 · insertResult · 纯函数/无副作用 × 每等价类合法值", () => {

  it("persists each legal result shape with its own generation", async () => {
    const store = newStore();
    try {
      accept(store, task("t-582-completed"));
      accept(store, task("t-582-failed"));
      accept(store, task("t-582-cancelled"));

      // 步骤 1：按 `每等价类合法值` 类构造参数 result——三个合法终态各一个代表值
      // 步骤 2：调用 insertResult(…)（store.ts:737，经 finishQueued 的正常路径触发）
      store.finishQueued(result("t-582-completed"));
      store.finishQueued(
        result("t-582-failed", {
          state: "Failed",
          failure: { code: "ModelUnavailable", cause_class: "Dependency", message: "down" },
        }),
      );
      store.finishQueued(result("t-582-cancelled", { state: "Cancelled" }));

      // 步骤 3：断言逐值对账——三行结果各自落库，state 与 failure 逐值对得上
      const rows = store.db.prepare("SELECT task_id,generation,result_json FROM results ORDER BY task_id").all() as any[];
      expect(rows.map((r: any) => r.task_id)).toEqual(["t-582-cancelled", "t-582-completed", "t-582-failed"]);
      expect(rows.every((r: any) => r.generation === 1)).toBe(true);
      expect(JSON.parse(rows[1].result_json).state).toBe("Completed");
      expect(JSON.parse(rows[2].result_json).failure.code).toBe("ModelUnavailable");
      expect(JSON.parse(rows[0].result_json).state).toBe("Cancelled");
    } finally {
      store.close();
    }
  });

});
