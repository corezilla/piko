/**
 * Case ID: UT-REPO-227  ·  STATUS: real
 *
 * 责任：参数 `attempt: number` 的 `+1 拒绝` 类（store.ts:431）
 * 维度坐标：`reserveModel` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-227.md（脚本的唯一依据）
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

describe("UT-REPO-227 · reserveModel · 数值/长度上限参数 × +1 拒绝", () => {

  it("admits attempt 1 and attempt 2 alike because there is no attempt ceiling", async () => {
    const store = newStore();
    try {
      accept(store, task("t-227"));

      // 步骤 1：按 `+1 拒绝` 类构造参数 attempt——边界值 1 与它的 +1 即 2
      // 步骤 2：调用 reserveModel(…)
      const atBoundary = store.reserveModel("t-227", "op-227", "step-227", 1);
      const atBoundaryPlusOne = store.reserveModel("t-227", "op-227", "step-227", 2);

      // 步骤 3：断言——实现的真实行为与该格名相左：`attempt` 没有任何上界校验，
      //         attempt=2 不被拒绝，而是作为复合主键的另一个成员另立一行
      expect(atBoundary).toBe(true);
      expect(atBoundaryPlusOne).toBe(true);
      const rows = store.db.prepare("SELECT attempt FROM model_attempts ORDER BY attempt").all() as any[];
      expect(rows).toEqual([{ attempt: 1 }, { attempt: 2 }]);
      expect(store.getRun("t-227").progress.model_calls).toBe(2);
    } finally {
      store.close();
    }
  });

});
