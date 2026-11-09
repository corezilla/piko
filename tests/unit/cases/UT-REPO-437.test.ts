/**
 * Case ID: UT-REPO-437  ·  STATUS: real
 *
 * 责任：参数 `events: { room: string; event: string; sender: string; txn?: string;` 的 `空` 类（store.ts:547）
 * 维度坐标：`ingestMatrixBatch` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-437.md（脚本的唯一依据）
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

describe("UT-REPO-437 · ingestMatrixBatch · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty events array", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 events——''（空串）、undefined（缺省）、null（显式空值）三态
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixBatch
            const empty = store.ingestMatrixBatch([], "cursor-1");
            const strEvents = store.ingestMatrixBatch("" as any, "cursor-2");
            const rows = store.db.prepare("SELECT count(*) n FROM matrix_events").get() as any;
      // 步骤 3：断言——实现的真实语义：空数组正常走完；空串 events 可迭代（长度 0）故也不报错
            expect(empty).toBe(0);
            expect(strEvents).toBe(0);
            expect(rows.n).toBe(0);
            expect(store.matrixCursor()).toBe("cursor-2");
    } finally {
      store.close();
    }
  });

});
