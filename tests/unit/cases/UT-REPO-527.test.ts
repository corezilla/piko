/**
 * Case ID: UT-REPO-527  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:634）
 * 维度坐标：`cancel` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-527.md（脚本的唯一依据）
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

describe("UT-REPO-527 · cancel · 字符串/路径/枚举输入 × 注入字符", () => {

  it("treats an injected task id as plain text and cancels that very task", async () => {
    const store = newStore();
    try {
      const injected = "t-527'; DROP TABLE runs;--";
      accept(store, task(injected));

      // 步骤 1：按 `注入字符` 类构造参数 taskId——穿越串 + SQL 元字符 + 控制字符
      // 步骤 2：调用 cancel(…)
      const outcome = store.cancel(injected);

      // 步骤 3：断言——实现的真实语义：task_id 是绑定参数，注入串不构成 SQL，
      //         原样匹配到那一条任务并把它取消；runs 表没有被破坏
      expect(outcome.outcome).toBe("CancelledBeforeStart");
      const rows = store.db.prepare("SELECT task_id,state,cancel_requested FROM runs").all() as any[];
      expect(rows).toEqual([{ task_id: injected, state: "Cancelled", cancel_requested: 1 }]);
      expect(store.db.prepare("SELECT count(*) n FROM runs").get()).toEqual({ n: 1 });
    } finally {
      store.close();
    }
  });

});
