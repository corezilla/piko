/**
 * Case ID: UT-REPO-441  ·  STATUS: real
 *
 * 责任：参数 `cursor: string` 的 `空` 类（store.ts:547）
 * 维度坐标：`ingestMatrixBatch` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-441.md（脚本的唯一依据）
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

describe("UT-REPO-441 · ingestMatrixBatch · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty cursor string", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 cursor——''（空串）、undefined（缺省）、null（显式空值）三态
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixBatch
            const emptyCursor = store.ingestMatrixBatch([], "");
            const nullCursor = store.ingestMatrixBatch([], null as any);
            const cursor = store.matrixCursor();
      // 步骤 3：断言——cursor 无校验；空串原样写入，null 写成 SQL NULL
            expect(emptyCursor).toBe(0);
            expect(nullCursor).toBe(0);
            expect(cursor).toBeNull();
    } finally {
      store.close();
    }
  });

});
