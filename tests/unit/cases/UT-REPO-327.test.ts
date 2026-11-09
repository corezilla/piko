/**
 * Case ID: UT-REPO-327  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:489）
 * 维度坐标：`markTurn` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-327.md（脚本的唯一依据）
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

describe("UT-REPO-327 · markTurn · 字符串/路径/枚举输入 × 超长", () => {

  it("accepts an over-long task id without a length cap", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 taskId——长度 2×4096＝8192；其余参数取合法等价类
      const longId = "t".repeat(8192);
      accept(store, task(longId));
      store.db
        .prepare("INSERT INTO discussion_turns(task_id,event_id,turn_seq,status,visible_content) VALUES(?,?,1,'Pending','hi')")
        .run(longId, "$e");

      // 步骤 2：调用 markTurn(…)
      store.markTurn(longId, "$e", "Consumed", "entry-1", "op-1");

      // 步骤 3：断言——实现的真实语义：markTurn 对 taskId 无长度上限，超长串被精确匹配并落终态
      const row = store.db.prepare("SELECT task_id,status,pi_entry_id FROM discussion_turns").get() as any;
      expect(row.task_id).toBe(longId);
      expect(row.task_id.length).toBe(8192);
      expect(row.status).toBe("Consumed");
      expect(row.pi_entry_id).toBe("entry-1");
    } finally {
      store.close();
    }
  });

});
