/**
 * Case ID: UT-REPO-362  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:516）
 * 维度坐标：`discussionAccessLost` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-362.md（脚本的唯一依据）
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

describe("UT-REPO-362 · discussionAccessLost · 字符串/路径/枚举输入 × 超长", () => {
  it("matches no loss record for an over-long task id", async () => {
    const store = newStore();
    try {
      acceptDiscussion(store, "t-362", "!room:362");
      store.markDiscussionAccessLost("!room:362");
      expect(store.discussionAccessLost("t-362")).toBe(true);
      const longId = "L".repeat(2 * 4096);

      // 步骤 1：按 `超长` 类构造参数 taskId——长度 2×上限（源码无比较常量，取缺省上限 4096 → 8192）；
      //         其余参数取合法等价类
      // 步骤 2：调用 discussionAccessLost(…)
      const lost = store.discussionAccessLost(longId);

      // 步骤 3：断言——实现无长度校验：超长 id 只是不匹配的查询键 → 返回 false，
      //         且没有任何地方持久化了这段超长文本
      expect(lost).toBe(false);
      const rows = store.db.prepare("SELECT task_id, length(task_id) lt FROM discussion_access_loss").all() as any[];
      expect(rows).toHaveLength(1);
      expect(rows[0].task_id).toBe("t-362");
      expect(rows[0].lt).toBe(5);
    } finally {
      store.close();
    }
  });

});
