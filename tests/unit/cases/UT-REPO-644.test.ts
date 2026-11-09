/**
 * Case ID: UT-REPO-644  ·  STATUS: real
 *
 * 责任：状态写 L822 → `db`（store.ts）
 * 维度坐标：`purge` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-644.md（脚本的唯一依据）
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

describe("UT-REPO-644 · purge · 持久化/序列化 × round-trip", () => {
  it("turns the task into a Tombstone with a null task_json", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:822 对 `db` 的写被执行的前置状态——一条 Active 的任务
      accept(store, task("t1"));
      const before = store.db.prepare("SELECT identity_state,task_json FROM tasks WHERE task_id='t1'").get() as any;
      // 步骤 2：调用 purge
            store.purge({ task_id: "t1" });
            const after = store.db.prepare("SELECT identity_state,task_json FROM tasks WHERE task_id='t1'").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(before.identity_state).toBe("Active");
            expect(JSON.parse(before.task_json).task_id).toBe("t1");
            expect(after.identity_state).toBe("Tombstone");
            expect(after.task_json).toBeNull();
    } finally {
      store.close();
    }
  });

});
