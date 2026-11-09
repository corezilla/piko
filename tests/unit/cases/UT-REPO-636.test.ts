/**
 * Case ID: UT-REPO-636  ·  STATUS: real
 *
 * 责任：分支 L807 `? scope === "all" :`（ternary；store.ts）
 * 维度坐标：`purge` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-636.md（脚本的唯一依据）
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

describe("UT-REPO-636 · purge · 状态分支 × 合法迁移", () => {
  it("takes the scope===\"all\" branch and the single-task branch", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:807 的分支（ternary：`? scope === "all" :`）取真的输入
      accept(store, task("t1"));
      accept(store, task("t2"));
      // 步骤 2：调用 purge 并断言该侧可观测结果
            const all = store.purge("all");
            const allRows = store.db.prepare("SELECT count(*) n FROM tasks").get() as any;
            // 步骤 3：构造使该分支取假的输入（单任务 scope）
            accept(store, task("t3"));
            const single = store.purge({ task_id: "t3" });
      // 步骤 3：断言——"all" 分支因两条任务都还没有过期的 purge_after 而什么都没删；
            // 单任务分支只删指定任务
            expect(all).toEqual({ removed: 0, tombstones: 0 });
            expect(allRows.n).toBe(2);
            expect(single).toEqual({ removed: 1, tombstones: 1 });
            expect((store.db.prepare("SELECT identity_state FROM tasks WHERE task_id='t3'").get() as any).identity_state).toBe("Tombstone");
            expect((store.db.prepare("SELECT identity_state FROM tasks WHERE task_id='t1'").get() as any).identity_state).toBe("Active");
    } finally {
      store.close();
    }
  });

});
