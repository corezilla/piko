/**
 * Case ID: UT-REPO-420  ·  STATUS: real
 *
 * 责任：分支 L532 `loop (turns)`（loop；store.ts）
 * 维度坐标：`ingestMatrixEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-420.md（脚本的唯一依据）
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

describe("UT-REPO-420 · ingestMatrixEvent · 状态分支 × 合法迁移", () => {
  it("iterates the turns list (empty list → no turn written)", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:532 的分支（loop：`loop (turns)`）取真的输入——给一条可见 turn
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixEvent 并断言该侧可观测结果
            const withTurn = store.ingestMatrixEvent("!r", "e1", "sender-1", "txn-1", [{ task: "d1", visible: "hello" }]);
            const turnRow = store.db.prepare("SELECT * FROM discussion_turns WHERE event_id='e1'").get() as any;
            // 步骤 3：构造使该分支取假的输入——空列表
            const withoutTurn = store.ingestMatrixEvent("!r", "e2", "sender-1", "txn-2", []);
      // 步骤 3：断言——取真侧为该任务新增一条 Pending turn；取假侧事件入库但无 turn
            expect(withTurn).toBe(true);
            expect(turnRow.task_id).toBe("d1");
            expect(turnRow.status).toBe("Pending");
            expect(turnRow.visible_content).toBe("hello");
            expect(turnRow.turn_seq).toBe(2);
            expect(withoutTurn).toBe(true);
            expect(store.db.prepare("SELECT count(*) n FROM discussion_turns WHERE event_id='e2'").get()).toEqual({ n: 0 });
    } finally {
      store.close();
    }
  });

});
