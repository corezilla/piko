/**
 * Case ID: UT-REPO-446  ·  STATUS: real
 *
 * 责任：分支 L551 `if (!inserted.changes)`（if；store.ts）
 * 维度坐标：`ingestMatrixBatch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-446.md（脚本的唯一依据）
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

describe("UT-REPO-446 · ingestMatrixBatch · 状态分支 × 合法迁移", () => {
  it("skips a redelivered event but still advances the cursor", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:551 的分支（if：`if (!inserted.changes)`）取真的输入——重投已有事件
      acceptDiscussion(store, "d1", "!r");
      store.ingestMatrixBatch([{ room: "!r", event: "e1", sender: "s", turns: [] }], "cursor-1");
      // 步骤 2：调用 ingestMatrixBatch 并断言该侧可观测结果
            const n = store.ingestMatrixBatch([{ room: "!r", event: "e1", sender: "s2", turns: [] }], "cursor-2");
            const rows = store.db.prepare("SELECT count(*) n FROM matrix_events").get() as any;
            // 步骤 3：构造使该分支取假的输入——全新事件
            store.ingestMatrixBatch([{ room: "!r", event: "e2", sender: "s", turns: [] }], "cursor-3");
      // 步骤 3：断言——取真侧 continue（跳过该条，但返回值仍是 events.length），取假侧正常插入
            expect(n).toBe(1);
            expect(rows.n).toBe(1);
            expect((store.db.prepare("SELECT count(*) n FROM matrix_events").get() as any).n).toBe(2);
            expect(store.matrixCursor()).toBe("cursor-3");
    } finally {
      store.close();
    }
  });

});
