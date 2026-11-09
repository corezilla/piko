/**
 * Case ID: UT-REPO-226  ·  STATUS: real
 *
 * 责任：参数 `attempt: number` 的 `恰好通过` 类（store.ts:431）
 * 维度坐标：`reserveModel` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-226.md（脚本的唯一依据）
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

describe("UT-REPO-226 · reserveModel · 数值/长度上限参数 × 恰好通过", () => {
  it("accepts the exact boundary attempt number and stores it verbatim", async () => {
    const store = newStore();
    try {
      accept(store, task("t-226"));

      // 步骤 1：按 `恰好通过` 类构造参数 attempt——边界值 0（源码无显式比较常量，
      //         取整数尝试计数的下边界）；其余参数取合法等价类
      // 步骤 2：调用 reserveModel(…)
      const reserved = store.reserveModel("t-226", "op", "step", 0);

      // 步骤 3：断言——实现的真实语义：attempt 没有下界守卫，边界值 0 原样通过并原样落库；
      //         计数与状态同步更新
      expect(reserved).toBe(true);
      const row = store.db.prepare("SELECT attempt, state, record_version FROM model_attempts").get() as any;
      expect(row.attempt).toBe(0);
      expect(typeof row.attempt).toBe("number");
      expect(row.state).toBe("Started");
      expect(row.record_version).toBe(1);
      expect((store.db.prepare("SELECT model_calls FROM runs WHERE task_id='t-226'").get() as any).model_calls).toBe(1);
    } finally {
      store.close();
    }
  });

});
