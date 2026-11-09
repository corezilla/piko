/**
 * Case ID: UT-REPO-615  ·  STATUS: real
 *
 * 责任：参数 `result: AgentResult` 的 `边界(上/下/零/空/满)` 类（store.ts:780）
 * 维度坐标：`finishQueued` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-615.md（脚本的唯一依据）
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

describe("UT-REPO-615 · finishQueued · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {

  it("accepts boundary result payloads and writes the terminal state", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `边界(上/下/零/空/满)` 类构造参数 result——空 summary／空 outputs 的最小结果；其余参数取合法等价类
      accept(store, task("t1"));

      // 步骤 2：调用 finishQueued(…)
      store.finishQueued(result("t1", { generation: 1, state: "Failed", summary: "", outputs: [] }));

      // 步骤 3：断言：被接受时返回值/状态与设计声明一致，逐值对账
      const run = store.db.prepare("SELECT state, finished_at FROM runs WHERE task_id='t1'").get() as any;
      expect(run.state).toBe("Failed");
      expect(run.finished_at).toBe("2026-11-09T00:00:00.000Z");
      const stored = store.db.prepare("SELECT result_json FROM results WHERE task_id='t1'").get() as any;
      const parsed = JSON.parse(stored.result_json);
      expect(parsed.summary).toBe("");
      expect(parsed.outputs).toEqual([]);
      expect(parsed.state).toBe("Failed");
      // 无未声明副作用：finishQueued 不碰执行槽
      expect(store.readSlot().task_id).toBeNull();
    } finally {
      store.close();
    }
  });

});
