/**
 * Case ID: UT-REPO-173  ·  STATUS: real
 *
 * 责任：状态写 L367 → `db`（store.ts）
 * 维度坐标：`failAccessLostTasks` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-173.md（脚本的唯一依据）
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

describe("UT-REPO-173 · failAccessLostTasks · 持久化/序列化 × round-trip", () => {
  it("abandons the pending discussion turns of the access-lost task", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:367 对 `db` 的写被执行的前置状态——
      // 一条讨论任务，其触发 turn 是 Pending；另有一条已是 Consumed 的 turn 不受影响
      acceptDiscussion(store, "lost-1", "!room:x");
      accept(store, task("other"));
      store.db
        .prepare(
          "INSERT INTO discussion_turns(task_id,event_id,turn_seq,status,visible_content,pi_entry_id,pi_operation_id) VALUES('other','$e9',1,'Consumed','c',NULL,NULL)",
        )
        .run();
      store.markDiscussionAccessLost("!room:x");
      const before = store.db.prepare("SELECT status FROM discussion_turns WHERE task_id='lost-1'").get() as any;
      expect(before.status).toBe("Pending");

      // 步骤 2：调用 failAccessLostTasks(…)
      expect(store.failAccessLostTasks()).toEqual(["lost-1"]);

      // 步骤 3：读回权威事实源（逐行对账）逐值对账写入语义
      const after = store.db.prepare("SELECT status FROM discussion_turns WHERE task_id='lost-1'").get() as any;
      expect(after.status).toBe("Abandoned");

      // 只影响 Pending/QueuedInPi 的 turn；已是 Consumed 的 turn 不被改写
      const untouched = store.db.prepare("SELECT status FROM discussion_turns WHERE task_id='other'").get() as any;
      expect(untouched.status).toBe("Consumed");
    } finally {
      store.close();
    }
  });

});
