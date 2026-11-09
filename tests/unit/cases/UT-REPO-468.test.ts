/**
 * Case ID: UT-REPO-468  ·  STATUS: real
 *
 * 责任：分支 L589 `JSON.parse(x.task_json).discussion?.room_id`（?.；store.ts）
 * 维度坐标：`openDiscussionRuns` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-468.md（脚本的唯一依据）
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

describe("UT-REPO-468 · openDiscussionRuns · 状态分支 × 合法迁移", () => {

  it("reads the room through the optional chain for every open run", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造两个同房间的开放讨论任务与一个不带 discussion 的任务
      store.createOrGet(discussionTask("od-468-a", "!room:468", "$e1"), "slinky", 10, "a");
      store.createOrGet(discussionTask("od-468-b", "!room:468", "$e2"), "slinky", 10, "b");
      store.createOrGet(task("od-468-c"), "slinky", 10);

      // 步骤 2：调用 openDiscussionRuns("!room:468")
      const runs = store.openDiscussionRuns("!room:468");

      // 步骤 3：断言逐值对账——可选链不短路，带 discussion 的两条被返回，
      // discussion 为 undefined 的那条因 room_id 不等于目标而被排除
      expect(runs.sort()).toEqual(["od-468-a", "od-468-b"]);
      expect(runs).not.toContain("od-468-c");
    } finally {
      store.close();
    }
  });

});
