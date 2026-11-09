/**
 * Case ID: UT-REPO-447  ·  STATUS: real
 *
 * 责任：分支 L551 `!inserted.changes`（!；store.ts）
 * 维度坐标：`ingestMatrixBatch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-447.md（脚本的唯一依据）
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

describe("UT-REPO-447 · ingestMatrixBatch · 状态分支 × 合法迁移", () => {
  it("negates inserted.changes exactly inside the batch loop", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:551 的分支（!：`!inserted.changes`）取真的输入——重投已有事件
      acceptDiscussion(store, "d1", "!r");
      store.ingestMatrixBatch([{ room: "!r", event: "e1", sender: "s", turns: [] }], "cursor-1");
      // 步骤 2：调用 ingestMatrixBatch 并断言该侧可观测结果
            const dup = store.ingestMatrixBatch([{ room: "!r", event: "e1", sender: "s", turns: [] }], "cursor-2");
            // 步骤 3：构造使该分支取假的输入——全新事件
            const fresh = store.ingestMatrixBatch([{ room: "!r", event: "e2", sender: "s", turns: [] }], "cursor-3");
      // 步骤 3：断言——重投时 changes=0 → !changes 取真 → continue；新事件 changes=1 → 正常插入
            expect(dup).toBe(1);
            expect(fresh).toBe(1);
            const rows = store.db.prepare("SELECT event_id FROM matrix_events ORDER BY event_id").all() as any[];
            expect(rows.map((r) => r.event_id)).toEqual(["e1", "e2"]);
    } finally {
      store.close();
    }
  });

});
