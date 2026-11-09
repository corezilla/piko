/**
 * Case ID: UT-REPO-169  ·  STATUS: real
 *
 * 责任：分支 L351 `(this.db.prepare("SELECT generation FROM runs…`（?.；store.ts）
 * 维度坐标：`failAccessLostTasks` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-169.md（脚本的唯一依据）
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

describe("UT-REPO-169 · failAccessLostTasks · 状态分支 × 合法迁移", () => {
  it("uses the run's own generation when it is readable", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:348 的分支（loop）取真的输入——一条被标记 access lost 的 Queued 任务，
      // 且它的 run generation 已被 mutateRun 推进到 3
      acceptDiscussion(store, "lost-1", "!room:x");
      store.mutateRun({ task_id: "lost-1", expected_generation: 1, mutation: () => {} });
      store.mutateRun({ task_id: "lost-1", expected_generation: 2, mutation: () => {} });
      store.markDiscussionAccessLost("!room:x");
      expect((store.db.prepare("SELECT generation FROM runs WHERE task_id='lost-1'").get() as any).generation).toBe(3);

      // 步骤 2：调用 failAccessLostTasks(…) 并断言该侧可观测结果与设计一致
      const failed = store.failAccessLostTasks();
      expect(failed).toEqual(["lost-1"]);

      // Result 行带的 generation 就是 runs.generation 的当前值 3（不是硬编码的 1）
      const row = store.db.prepare("SELECT generation FROM results WHERE task_id='lost-1'").get() as any;
      expect(row.generation).toBe(3);

      // 步骤 3：构造使该分支取假的输入（该任务已终态，循环体跳过）
      // 步骤 4：再次调用 failAccessLostTasks(…) 并断言取假侧结果；两侧都必须被观测到
      expect(store.failAccessLostTasks()).toEqual([]);
    } finally {
      store.close();
    }
  });

});
