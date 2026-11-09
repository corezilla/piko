/**
 * Case ID: UT-REPO-444  ·  STATUS: real
 *
 * 责任：分支 L549 `loop (events)`（loop；store.ts）
 * 维度坐标：`ingestMatrixBatch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-444.md（脚本的唯一依据）
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

describe("UT-REPO-444 · ingestMatrixBatch · 状态分支 × 合法迁移", () => {
  it("iterates every event in the batch", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:549 的分支（loop：`loop (events)`）取真的输入——两条事件
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixBatch 并断言该侧可观测结果
            const n = store.ingestMatrixBatch(
              [
                { room: "!r", event: "e1", sender: "s", turns: [] },
                { room: "!r", event: "e2", sender: "s", turns: [] },
              ],
              "cursor-1",
            );
            const rows = store.db.prepare("SELECT event_id FROM matrix_events ORDER BY event_id").all() as any[];
            // 步骤 3：构造使该分支取假的输入——空批次
            const empty = store.ingestMatrixBatch([], "cursor-2");
      // 步骤 3：断言——取真侧两条事件都入库；取假侧一条都不写
            expect(n).toBe(2);
            expect(rows.map((r) => r.event_id)).toEqual(["e1", "e2"]);
            expect(empty).toBe(0);
    } finally {
      store.close();
    }
  });

});
