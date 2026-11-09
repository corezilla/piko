/**
 * Case ID: UT-REPO-364  ·  STATUS: real
 *
 * 责任：分支 L517 `!!this.db.prepare("SELECT 1 FROM discussion_a…`（!；store.ts）
 * 维度坐标：`discussionAccessLost` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-364.md（脚本的唯一依据）
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

describe("UT-REPO-364 · discussionAccessLost · 状态分支 × 合法迁移", () => {

  it("reports true only for a task that has a discussion_access_loss row", async () => {
    const store = newStore();
    try {
      acceptDiscussion(store, "t-364", "!room:test");
      acceptDiscussion(store, "t-364b", "!room:test");

      // 步骤 1：构造使 store.ts:517 的分支（!：`!!...get(taskId)`）取真的输入
      // 步骤 2：调用 discussionAccessLost(…) 并断言该侧可观测结果
      expect(store.discussionAccessLost("t-364")).toBe(false);
      expect(store.markDiscussionAccessLost("!room:test")).toEqual(["t-364", "t-364b"]);
      expect(store.discussionAccessLost("t-364")).toBe(true);

      // 步骤 3：构造使该分支取假的输入——另一个同样丢了访问权的任务也返回真，
      //         而完全不存在的任务返回假
      expect(store.discussionAccessLost("t-364b")).toBe(true);
      expect(store.discussionAccessLost("no-such-task")).toBe(false);

      // 步骤 4：再次调用 discussionAccessLost(…) 并断言取假侧结果（两侧都被观测到）
      expect(store.discussionAccessLost("t-364")).toBe(true);
      expect(store.discussionAccessLost("no-such-task")).toBe(false);
    } finally {
      store.close();
    }
  });

});
