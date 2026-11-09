/**
 * Case ID: UT-REPO-472  ·  STATUS: real
 *
 * 责任：返回站点 L591 值 `false` 逐值断言（store.ts）
 * 维度坐标：`openDiscussionRuns` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-472.md（脚本的唯一依据）
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

describe("UT-REPO-472 · openDiscussionRuns · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns false for a run whose json cannot be parsed", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一个 task_json 被破坏的 run 行
      store.createOrGet(discussionTask("od-472", "!room:472", "$e1"), "slinky", 10, "a");
      store.db.prepare("UPDATE tasks SET task_json='not-json' WHERE task_id=?").run("od-472");

      // 步骤 2：调用 openDiscussionRuns("!room:472")
      const runs = store.openDiscussionRuns("!room:472");

      // 步骤 3：断言逐值对账——catch 分支返回 false，该行被过滤掉，不进结果数组
      expect(runs).toEqual([]);
    } finally {
      store.close();
    }
  });

});
