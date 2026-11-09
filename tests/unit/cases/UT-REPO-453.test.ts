/**
 * Case ID: UT-REPO-453  ·  STATUS: real
 *
 * 责任：状态写 L562 → `db`（store.ts）
 * 维度坐标：`ingestMatrixBatch` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-453.md（脚本的唯一依据）
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

describe("UT-REPO-453 · ingestMatrixBatch · 持久化/序列化 × round-trip", () => {
  it("advances the sync cursor on every batch", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:562 对 `db` 的写被执行的前置状态——matrix_state 已有默认行
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixBatch
            const before = store.matrixCursor();
            const n = store.ingestMatrixBatch([{ room: "!r", event: "e1", sender: "s", turns: [] }], "cursor-42");
            const after = store.matrixCursor();
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(before).toBeNull();
            expect(n).toBe(1);
            expect(after).toBe("cursor-42");
            const row = store.db.prepare("SELECT sync_cursor FROM matrix_state WHERE singleton=1").get() as any;
            expect(row.sync_cursor).toBe("cursor-42");
    } finally {
      store.close();
    }
  });

});
