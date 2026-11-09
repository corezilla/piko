/**
 * Case ID: UT-REPO-167  ·  STATUS: real
 *
 * 责任：分支 L348 `loop (rows)`（loop；store.ts）
 * 维度坐标：`failAccessLostTasks` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-167.md（脚本的唯一依据）
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

describe("UT-REPO-167 · failAccessLostTasks · 状态分支 × 合法迁移", () => {
  it("iterates over exactly the access-lost tasks that are still Queued", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:348 的分支（loop：`loop (rows)`）取真的输入——
      // 两条讨论任务（room 相同）被标记为 access lost，另有一条普通任务与一条不同 room 的任务
      acceptDiscussion(store, "lost-1", "!room:x");
      acceptDiscussion(store, "lost-2", "!room:x");
      acceptDiscussion(store, "other-room", "!room:y");
      accept(store, task("plain"));
      const marked = store.markDiscussionAccessLost("!room:x");
      expect(marked).toEqual(["lost-1", "lost-2"]);

      // 步骤 2：调用 failAccessLostTasks(…) 并断言该侧可观测结果与设计一致
      const failed = store.failAccessLostTasks();
      expect(failed).toEqual(["lost-1", "lost-2"]);

      // 步骤 3：构造使该分支取假的输入——没有 access-lost 的 Queued 任务
      // 步骤 4：再次调用 failAccessLostTasks(…) 并断言取假侧结果；两侧都必须被观测到
      const again = store.failAccessLostTasks();
      expect(again).toEqual([]);

      // 取真侧确实写入了终态；取假侧没有动别的任务
      const states = Object.fromEntries(
        (store.db.prepare("SELECT task_id,state FROM runs ORDER BY task_id").all() as any[]).map((r) => [r.task_id, r.state]),
      );
      expect(states).toEqual({ "lost-1": "Failed", "lost-2": "Failed", "other-room": "Queued", plain: "Queued" });
    } finally {
      store.close();
    }
  });

});
