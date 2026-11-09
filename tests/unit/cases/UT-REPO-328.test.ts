/**
 * Case ID: UT-REPO-328  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:489）
 * 维度坐标：`markTurn` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-328.md（脚本的唯一依据）
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

describe("UT-REPO-328 · markTurn · 字符串/路径/枚举输入 × 注入字符", () => {
  it("binds an injected task id as plain text and matches no turn", async () => {
    const store = newStore();
    try {
      acceptDiscussion(store, "t-328", "!room:328");
      const injection = "t-328'; DROP TABLE discussion_turns;--";

      // 步骤 1：按 `注入字符` 类构造参数 taskId——含 SQL 元字符的注入串；
      //         其余参数取合法等价类
      // 步骤 2：调用 markTurn(…)
      const returned = store.markTurn(injection, "$e1", "Consumed");

      // 步骤 3：断言——实现无校验语句，但参数走的是绑定层：注入串被当作普通文本去匹配，
      //         匹配不到任何 turn → 静默返回 undefined；表结构与数据都没有被破坏
      expect(returned).toBeUndefined();
      const tables = store.db
        .prepare("SELECT count(*) n FROM sqlite_master WHERE type='table' AND name='discussion_turns'")
        .get() as any;
      expect(tables.n).toBe(1);
      const turns = store.db.prepare("SELECT task_id, status FROM discussion_turns").all() as any[];
      expect(turns).toEqual([{ task_id: "t-328", status: "Pending" }]);
    } finally {
      store.close();
    }
  });

});
