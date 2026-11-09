/**
 * Case ID: UT-REPO-363  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:516）
 * 维度坐标：`discussionAccessLost` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-363.md（脚本的唯一依据）
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

describe("UT-REPO-363 · discussionAccessLost · 字符串/路径/枚举输入 × 注入字符", () => {
  it("binds an injected task id as plain text and matches no loss record", async () => {
    const store = newStore();
    try {
      acceptDiscussion(store, "t-363", "!room:363");
      store.markDiscussionAccessLost("!room:363");
      const injection = "t-363' OR '1'='1";

      // 步骤 1：按 `注入字符` 类构造参数 taskId——含 SQL 元字符的注入串；
      //         其余参数取合法等价类
      // 步骤 2：调用 discussionAccessLost(…)
      const lost = store.discussionAccessLost(injection);

      // 步骤 3：断言——实现无校验语句，但参数走的是绑定层：注入串被当作普通文本去匹配，
      //         匹配不到任何 loss 记录 → 返回 false；表结构与数据都没有被破坏
      expect(lost).toBe(false);
      const rows = store.db.prepare("SELECT task_id FROM discussion_access_loss").all() as any[];
      expect(rows).toEqual([{ task_id: "t-363" }]);
      const tables = store.db
        .prepare("SELECT count(*) n FROM sqlite_master WHERE type='table' AND name='discussion_access_loss'")
        .get() as any;
      expect(tables.n).toBe(1);
    } finally {
      store.close();
    }
  });

});
