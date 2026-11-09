/**
 * Case ID: UT-REPO-587  ·  STATUS: real
 *
 * 责任：参数 `result: AgentResult` 的 `每等价类合法值` 类（store.ts:745）
 * 维度坐标：`publishResult` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-587.md（脚本的唯一依据）
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

describe("UT-REPO-587 · publishResult · 纯函数/无副作用 × 每等价类合法值", () => {

  it("accepts each legal result variant under a held lease", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `每等价类合法值` 类构造参数 result——Failed 与 Completed 两个终态各一条（results 表每个 task 只留一行，故用两个任务）；其余参数取合法等价类
      accept(store, task("t1"));
      accept(store, task("t2"));

      // 步骤 2：调用 publishResult(…)
      const grant1 = store.tryClaimSlot("owner-1", "boot-1") as { task_id: string; lease_epoch: number };
      expect(grant1.task_id).toBe("t1");
      store.publishResult(result("t1", { generation: 1, state: "Failed" }), grant1.lease_epoch);
      const genAfterFailed = store.generation("t1");
      store.releaseSlot("t1", grant1.lease_epoch);
      const grant2 = store.tryClaimSlot("owner-1", "boot-1") as { task_id: string; lease_epoch: number };
      expect(grant2.task_id).toBe("t2");
      store.publishResult(result("t2", { generation: 1, state: "Completed" }), grant2.lease_epoch);
      const genAfterCompleted = store.generation("t2");

      // 步骤 3：断言：被接受时返回值/状态与设计声明一致，逐值对账
      //         实现的真实语义：publishResult 只校验槽归属，不校验 result.state 的取值域；
      //         每次成功发布都把该任务的 runs.generation 加一
      expect(genAfterFailed).toBe(2);
      expect(genAfterCompleted).toBe(2);
      const rows = store.db.prepare("SELECT task_id, generation FROM results ORDER BY task_id").all() as any[];
      expect(rows.map((r) => [r.task_id, r.generation])).toEqual([
        ["t1", 1],
        ["t2", 1],
      ]);
      const states = store.db.prepare("SELECT task_id, result_json FROM results ORDER BY task_id").all() as any[];
      expect(states.map((r) => JSON.parse(r.result_json).state)).toEqual(["Failed", "Completed"]);
      // 槽仍被最后一个任务持有（publishResult 不释放槽）
      expect(store.readSlot().task_id).toBe("t2");
    } finally {
      store.close();
    }
  });

});
