/**
 * Case ID: UT-REPO-172  ·  STATUS: real
 *
 * 责任：状态写 L366 → `db`（store.ts）
 * 维度坐标：`failAccessLostTasks` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-172.md（脚本的唯一依据）
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

describe("UT-REPO-172 · failAccessLostTasks · 持久化/序列化 × round-trip", () => {
  it("writes the terminal Failed state and finished_at for the access-lost run", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:366 对 `db` 的写被执行的前置状态——一条 access-lost 的 Queued 任务
      acceptDiscussion(store, "lost-1", "!room:x");
      store.markDiscussionAccessLost("!room:x");
      const before = store.db.prepare("SELECT state,finished_at,last_activity_at FROM runs WHERE task_id='lost-1'").get() as any;
      expect(before.state).toBe("Queued");
      expect(before.finished_at).toBeNull();

      // 步骤 2：调用 failAccessLostTasks(…)
      expect(store.failAccessLostTasks()).toEqual(["lost-1"]);

      // 步骤 3：读回权威事实源（逐行对账）逐值对账写入语义
      const after = store.db.prepare("SELECT state,finished_at,last_activity_at FROM runs WHERE task_id='lost-1'").get() as any;
      expect(after.state).toBe("Failed");
      expect(typeof after.finished_at).toBe("string");
      expect(after.finished_at.length).toBeGreaterThan(0);
      expect(after.last_activity_at).toBe(after.finished_at);
    } finally {
      store.close();
    }
  });

});
