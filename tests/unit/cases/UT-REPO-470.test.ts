/**
 * Case ID: UT-REPO-470  ·  STATUS: real
 *
 * 责任：返回站点 L584 值 `(this.db .prepare("SELECT r.task_id,t.t…` 逐值断言（store.ts）
 * 维度坐标：`openDiscussionRuns` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-470.md（脚本的唯一依据）
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

describe("UT-REPO-470 · openDiscussionRuns · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the task ids selected by the open-intake query", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造两条开放讨论任务与一条不带 discussion 的任务
      store.createOrGet(discussionTask("od-470-a", "!room:470", "$e1"), "slinky", 10, "a");
      store.createOrGet(discussionTask("od-470-b", "!room:470", "$e2"), "slinky", 10, "b");
      store.createOrGet(task("od-470-c"), "slinky", 10);

      // 步骤 2：调用 openDiscussionRuns("!room:470")
      const runs = store.openDiscussionRuns("!room:470");

      // 步骤 3：断言逐值对账——查询只取 discussion_intake_state='Open' 且 identity_state='Active' 的行
      expect(runs.sort()).toEqual(["od-470-a", "od-470-b"]);
      expect(store.getRun("od-470-a").discussion_intake_state).toBe("Open");
      expect(store.getRun("od-470-c").discussion_intake_state).toBe("Disabled");
    } finally {
      store.close();
    }
  });

});
