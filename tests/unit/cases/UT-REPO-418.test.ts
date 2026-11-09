/**
 * Case ID: UT-REPO-418  ·  STATUS: real
 *
 * 责任：分支 L531 `if (!inserted.changes)`（if；store.ts）
 * 维度坐标：`ingestMatrixEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-418.md（脚本的唯一依据）
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

describe("UT-REPO-418 · ingestMatrixEvent · 状态分支 × 合法迁移", () => {
  it("returns false on a redelivered (room, event) pair", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:531 的分支（if：`if (!inserted.changes)`）取真的输入——同一事件重投
      acceptDiscussion(store, "d1", "!r");
      store.ingestMatrixEvent("!r", "e1", "sender-1", "txn-1", []);
      // 步骤 2：调用 ingestMatrixEvent 并断言该侧可观测结果
            const again = store.ingestMatrixEvent("!r", "e1", "sender-2", "txn-9", []);
            const rows = store.db.prepare("SELECT count(*) n FROM matrix_events").get() as any;
            // 步骤 3：构造使该分支取假的输入——一个全新事件
            const fresh = store.ingestMatrixEvent("!r", "e2", "sender-1", "txn-2", []);
      // 步骤 3：断言——取真侧返回 false 且不新增行；取假侧返回 true
            expect(again).toBe(false);
            expect(rows.n).toBe(1);
            expect(fresh).toBe(true);
            expect((store.db.prepare("SELECT count(*) n FROM matrix_events").get() as any).n).toBe(2);
    } finally {
      store.close();
    }
  });

});
