/**
 * Case ID: UT-REPO-442  ·  STATUS: real
 *
 * 责任：参数 `cursor: string` 的 `超长` 类（store.ts:547）
 * 维度坐标：`ingestMatrixBatch` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-442.md（脚本的唯一依据）
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

describe("UT-REPO-442 · ingestMatrixBatch · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an over-long cursor string", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 cursor——长度 2×上限 = 8192；其余参数取合法等价类
      acceptDiscussion(store, "d1", "!r");
      const longCursor = "c".repeat(8192);
      // 步骤 2：调用 ingestMatrixBatch
            const n = store.ingestMatrixBatch([], longCursor);
            const cursor = store.matrixCursor();
      // 步骤 3：断言——cursor 不做长度校验，超长串原样写入
            expect(n).toBe(0);
            expect(cursor).toBe(longCursor);
            expect(cursor?.length).toBe(8192);
    } finally {
      store.close();
    }
  });

});
