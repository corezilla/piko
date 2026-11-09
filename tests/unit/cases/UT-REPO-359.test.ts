/**
 * Case ID: UT-REPO-359  ·  STATUS: real
 *
 * 责任：返回站点 L507 值 `false` 逐值断言（store.ts）
 * 维度坐标：`markDiscussionAccessLost` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-359.md（脚本的唯一依据）
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

describe("UT-REPO-359 · markDiscussionAccessLost · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns false for a task whose json cannot be parsed", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一个 task_json 被破坏的 run 行
      store.createOrGet(discussionTask("md-359", "!room:359", "$e1"), "slinky", 10, "a");
      store.db.prepare("UPDATE tasks SET task_json='not-json' WHERE task_id=?").run("md-359");

      // 步骤 2：调用 markDiscussionAccessLost("!room:359")
      const affected = store.markDiscussionAccessLost("!room:359");

      // 步骤 3：断言逐值对账——catch 分支返回 false，该行被跳过，不进 affected
      expect(affected).toEqual([]);
      expect(store.discussionAccessLost("md-359")).toBe(false);
    } finally {
      store.close();
    }
  });

});
