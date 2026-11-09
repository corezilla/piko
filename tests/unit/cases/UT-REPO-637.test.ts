/**
 * Case ID: UT-REPO-637  ·  STATUS: real
 *
 * 责任：分支 L814 `loop (rows)`（loop；store.ts）
 * 维度坐标：`purge` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-637.md（脚本的唯一依据）
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

describe("UT-REPO-637 · purge · 状态分支 × 合法迁移", () => {
  it("iterates the candidate rows and purges each of them", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:814 的分支（loop：`loop (rows)`）取真的输入——两条已到期且终态的任务
      accept(store, task("t1"));
      accept(store, task("t2"));
      store.db.prepare("UPDATE runs SET state='Completed' WHERE task_id IN ('t1','t2')").run();
      store.db.prepare("UPDATE tasks SET purge_after='2000-01-01' WHERE task_id IN ('t1','t2')").run();
      // 步骤 2：调用 purge 并断言该侧可观测结果
            const out = store.purge("all");
            const rows = store.db.prepare("SELECT task_id,identity_state FROM tasks ORDER BY task_id").all() as any[];
            // 步骤 3：构造使该分支取假的输入——没有符合条件的行
            const again = store.purge("all");
      // 步骤 3：断言——取真侧两条都被墓碑化；取假侧循环体不执行
            expect(out).toEqual({ removed: 2, tombstones: 2 });
            expect(rows.map((r) => r.identity_state)).toEqual(["Tombstone", "Tombstone"]);
            expect(again).toEqual({ removed: 0, tombstones: 0 });
    } finally {
      store.close();
    }
  });

});
