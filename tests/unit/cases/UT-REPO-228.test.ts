/**
 * Case ID: UT-REPO-228  ·  STATUS: real
 *
 * 责任：参数 `attempt: number` 的 `−1 通过` 类（store.ts:431）
 * 维度坐标：`reserveModel` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-228.md（脚本的唯一依据）
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

describe("UT-REPO-228 · reserveModel · 数值/长度上限参数 × −1 通过", () => {

  it("accepts attempt = -1 and counts it as a model call", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `−1 通过` 类构造参数 attempt——边界值 −1；其余参数取合法等价类
      accept(store, task("t1"));
      const before = (store.db.prepare("SELECT model_calls FROM runs WHERE task_id='t1'").get() as any).model_calls;

      // 步骤 2：调用 reserveModel(…)
      const reserved = store.reserveModel("t1", "op", "step", -1);

      // 步骤 3：断言：被接受时返回值/状态与设计声明一致，逐值对账
      expect(reserved).toBe(true);
      const row = store.db.prepare("SELECT attempt, state FROM model_attempts WHERE task_id='t1' AND operation_id='op'").get() as any;
      expect(row.attempt).toBe(-1);
      expect(row.state).toBe("Started");
      expect((store.db.prepare("SELECT model_calls FROM runs WHERE task_id='t1'").get() as any).model_calls).toBe(before + 1);
    } finally {
      store.close();
    }
  });

});
