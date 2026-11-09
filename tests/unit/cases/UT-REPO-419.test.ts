/**
 * Case ID: UT-REPO-419  ·  STATUS: real
 *
 * 责任：分支 L531 `!inserted.changes`（!；store.ts）
 * 维度坐标：`ingestMatrixEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-419.md（脚本的唯一依据）
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

describe("UT-REPO-419 · ingestMatrixEvent · 状态分支 × 合法迁移", () => {
  it("negates inserted.changes exactly (fresh event → not busy)", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:531 的分支（!：`!inserted.changes`）取真的输入——重投已有事件
      acceptDiscussion(store, "d1", "!r");
      store.ingestMatrixEvent("!r", "e1", "sender-1", "txn-1", []);
      // 步骤 2：调用 ingestMatrixEvent 并断言该侧可观测结果
            const duplicate = store.ingestMatrixEvent("!r", "e1", "sender-1", "txn-1", []);
            // 步骤 3：构造使该分支取假的输入——全新事件
            const fresh = store.ingestMatrixEvent("!r", "e2", "sender-1", "txn-2", []);
      // 步骤 3：断言——重投时 INSERT OR IGNORE 的 changes=0 → !changes 取真 → 返回 false
            expect(duplicate).toBe(false);
            expect(fresh).toBe(true);
            expect((store.db.prepare("SELECT count(*) n FROM matrix_events").get() as any).n).toBe(2);
    } finally {
      store.close();
    }
  });

});
