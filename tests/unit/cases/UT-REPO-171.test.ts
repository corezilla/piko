/**
 * Case ID: UT-REPO-171  ·  STATUS: real
 *
 * 责任：状态写 L363 → `db`（store.ts）
 * 维度坐标：`failAccessLostTasks` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-171.md（脚本的唯一依据）
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

describe("UT-REPO-171 · failAccessLostTasks · 持久化/序列化 × round-trip", () => {
  it("writes the DiscussionAccessLost Result row that can be read back from the store", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:363 对 `db` 的写被执行的前置状态——一条 access-lost 的 Queued 任务
      acceptDiscussion(store, "lost-1", "!room:x");
      store.markDiscussionAccessLost("!room:x");

      // 步骤 2：调用 failAccessLostTasks(…)
      expect(store.failAccessLostTasks()).toEqual(["lost-1"]);

      // 步骤 3：读回权威事实源（逐行对账）逐值对账写入语义
      const row = store.db
        .prepare("SELECT task_id,generation,result_json,result_sha256,published_at FROM results WHERE task_id='lost-1'")
        .get() as any;
      expect(row).toBeTruthy();
      expect(row.task_id).toBe("lost-1");
      expect(row.generation).toBe(1);

      const parsed = JSON.parse(row.result_json);
      expect(parsed.task_id).toBe("lost-1");
      expect(parsed.generation).toBe(1);
      expect(parsed.state).toBe("Failed");
      expect(parsed.partial).toBe(false);
      expect(parsed.summary).toBe("Discussion access was lost before the task could run.");
      expect(parsed.outputs).toEqual([]);
      expect(parsed.failure).toEqual({
        code: "DiscussionAccessLost",
        cause_class: "Authorization",
        message: "Piko lost access to the discussion room.",
      });
      // published_at 落库且非空
      expect(typeof row.published_at).toBe("string");
      expect(row.published_at.length).toBeGreaterThan(0);
      // result_sha256 是 result_json 的 sha256
      const { createHash } = await import("node:crypto");
      expect(row.result_sha256).toBe(createHash("sha256").update(row.result_json).digest("hex"));
    } finally {
      store.close();
    }
  });

});
