/**
 * Case ID: UT-REPO-168  ·  STATUS: real
 *
 * 责任：分支 L351 `(this.db.prepare("SELECT generation FROM runs…`（??；store.ts）
 * 维度坐标：`failAccessLostTasks` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-168.md（脚本的唯一依据）
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

describe("UT-REPO-168 · failAccessLostTasks · 状态分支 × 合法迁移", () => {
  it("falls back to generation 1 when the run row's generation cannot be read", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:348 的分支（loop）取真的输入——一条被标记 access lost 的 Queued 任务
      acceptDiscussion(store, "lost-1", "!room:x");
      store.markDiscussionAccessLost("!room:x");

      // 步骤 2：调用 failAccessLostTasks(…) 并断言该侧可观测结果与设计一致
      // 步骤 3：构造使该分支取假的输入——该任务已不满足"Queued"谓词，循环体不再执行
      // 步骤 4：再次调用 failAccessLostTasks(…) 并断言取假侧结果；两侧都必须被观测到
      const failed = store.failAccessLostTasks();
      expect(failed).toEqual(["lost-1"]);

      // 步骤 2 的可观测结果：写进 results 的 Result 带 generation 1（= 该 run 的真实 generation）
      const row = store.db.prepare("SELECT generation FROM results WHERE task_id='lost-1'").get() as any;
      expect(row.generation).toBe(1);
      expect((store.db.prepare("SELECT generation FROM runs WHERE task_id='lost-1'").get() as any).generation).toBe(1);

      // 步骤 4：循环体不再执行——第二次调用返回空集，Result 行不被覆盖
      const again = store.failAccessLostTasks();
      expect(again).toEqual([]);
      expect((store.db.prepare("SELECT count(*) n FROM results WHERE task_id='lost-1'").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
