/**
 * Case ID: UT-REPO-448  ·  STATUS: real
 *
 * 责任：分支 L552 `loop (item.turns)`（loop；store.ts）
 * 维度坐标：`ingestMatrixBatch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-448.md（脚本的唯一依据）
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

describe("UT-REPO-448 · ingestMatrixBatch · 状态分支 × 合法迁移", () => {
  it("iterates item.turns inside the batch loop", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:552 的分支（loop：`loop (item.turns)`）取真的输入——带 turn 的事件
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixBatch 并断言该侧可观测结果
            const n = store.ingestMatrixBatch([{ room: "!r", event: "e1", sender: "s", turns: [{ task: "d1", visible: "hi" }] }], "cursor-1");
            const turnRow = store.db.prepare("SELECT * FROM discussion_turns WHERE event_id='e1'").get() as any;
            // 步骤 3：构造使该分支取假的输入——空 turns 列表
            const n2 = store.ingestMatrixBatch([{ room: "!r", event: "e2", sender: "s", turns: [] }], "cursor-2");
      // 步骤 3：断言——取真侧新增一条 Pending turn；取假侧事件入库但无 turn
            expect(n).toBe(1);
            expect(turnRow.task_id).toBe("d1");
            expect(turnRow.status).toBe("Pending");
            expect(turnRow.visible_content).toBe("hi");
            expect(n2).toBe(1);
            expect(store.db.prepare("SELECT count(*) n FROM discussion_turns WHERE event_id='e2'").get()).toEqual({ n: 0 });
    } finally {
      store.close();
    }
  });

});
