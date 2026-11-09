/**
 * Case ID: UT-REPO-596  ·  STATUS: real
 *
 * 责任：参数 `result: AgentResult` 的 `每等价类合法值` 类（store.ts:755）
 * 维度坐标：`finish` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-596.md（脚本的唯一依据）
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

describe("UT-REPO-596 · finish · 纯函数/无副作用 × 每等价类合法值", () => {

  it("accepts each legal terminal state and writes it to the run row", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `每等价类合法值` 类构造 result——三种终态各一条；
      // 单一执行槽一次只归一个任务，且 tryClaimSlot 按 accepted_at,task_id 取最旧的 Queued，
      // 故逐条受理→申领→finish，不依赖哪条被选中
      const states = ["Completed", "Failed", "Cancelled"] as const;

      // 步骤 2：调用 finish(…)
      for (const state of states) {
        const id = "t-596-" + state.toLowerCase();
        accept(store, task(id));
        const grant = store.tryClaimSlot("owner", "boot") as { task_id: string; lease_epoch: number };
        expect(grant.task_id).toBe(id);
        store.finish(result(id, { state }), grant.lease_epoch);
      }

      // 步骤 3：断言——被接受：三种终态逐值写进 runs.state，且每条都落了结果
      const rows = store.db.prepare("SELECT task_id,state FROM runs WHERE task_id LIKE 't-596-%' ORDER BY task_id").all() as any[];
      expect(rows.map((r) => r.task_id)).toEqual(["t-596-cancelled", "t-596-completed", "t-596-failed"]);
      expect(rows.map((r) => r.state)).toEqual(["Cancelled", "Completed", "Failed"]);
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(3);
      expect(store.result("t-596-failed").state).toBe("Failed");
    } finally {
      store.close();
    }
  });

});
