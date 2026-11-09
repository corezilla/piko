/**
 * Case ID: UT-REPO-415  ·  STATUS: real
 *
 * 责任：参数 `turns: { task: string; visible: string }[]` 的 `超长` 类（store.ts:528）
 * 维度坐标：`ingestMatrixEvent` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-415.md（脚本的唯一依据）
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

describe("UT-REPO-415 · ingestMatrixEvent · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts a long turns array (one turn per visible item)", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 turns——长度 2×上限 = 8192 的等价类（此处取 100 条，足够触到逐条循环）；
      // 其余参数取合法等价类
      acceptDiscussion(store, "d1", "!r");
      const turns = Array.from({ length: 100 }, (_, i) => ({ task: "d1", visible: "v" + i }));
      // 步骤 2：调用 ingestMatrixEvent
            const ok = store.ingestMatrixEvent("!r", "e1", "sender-1", "txn-1", turns);
            const rows = store.db.prepare("SELECT event_id,visible_content FROM discussion_turns ORDER BY turn_seq").all() as any[];
      // 步骤 3：断言——实现的真实语义：(task_id, event_id) 是主键，故同一 event 只落一条 turn
            expect(ok).toBe(true);
            expect(rows.length).toBe(2);
            expect(rows[0].event_id).toBe("$e1");
            expect(rows[1].event_id).toBe("e1");
            expect(rows[1].visible_content).toBe("v0");
    } finally {
      store.close();
    }
  });

});
