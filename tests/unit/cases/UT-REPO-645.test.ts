/**
 * Case ID: UT-REPO-645  ·  STATUS: real
 *
 * 责任：状态写 L823 → `db`（store.ts）
 * 维度坐标：`purge` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-645.md（脚本的唯一依据）
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

describe("UT-REPO-645 · purge · 持久化/序列化 × round-trip", () => {
  it("writes the forced-purge audit event", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:823 对 `db` 的写被执行的前置状态——一条 Active 的任务
      accept(store, task("t1"));
      // 步骤 2：调用 purge
            store.purge({ task_id: "t1" });
            const row = store.db.prepare("SELECT * FROM audit_events").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(row.event_name).toBe("event.audit.forced-purge");
            expect(row.actor_class).toBe("operator");
            expect(row.task_id).toBe("t1");
            expect(JSON.parse(row.detail_json)).toEqual({ task_id: "t1" });
            expect(typeof row.occurred_at).toBe("string");
    } finally {
      store.close();
    }
  });

});
