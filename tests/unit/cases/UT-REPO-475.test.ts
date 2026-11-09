/**
 * Case ID: UT-REPO-475  ·  STATUS: real
 *
 * 责任：参数 `cursor: string` 的 `超长` 类（store.ts:599）
 * 维度坐标：`setMatrixCursor` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-475.md（脚本的唯一依据）
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

describe("UT-REPO-475 · setMatrixCursor · 字符串/路径/枚举输入 × 超长", () => {
  it("stores an over-long cursor verbatim without rejecting it", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造参数 cursor——源码里没有长度比较常量，取上限 4096 的 2 倍
      const longCursor = "c".repeat(8192);

      // 步骤 2：调用 setMatrixCursor(…)
      store.setMatrixCursor(longCursor);

      // 步骤 3：断言——实现的真实语义：setMatrixCursor 零校验，
      //         超长串原样落库并被 matrixCursor 原样读回（不抛 typed 错误）
      expect(store.matrixCursor()).toBe(longCursor);
      expect((store.matrixCursor() as string).length).toBe(8192);
      const row = store.db.prepare("SELECT sync_cursor FROM matrix_state WHERE singleton=1").get() as any;
      expect(row.sync_cursor.length).toBe(8192);
    } finally {
      store.close();
    }
  });

});
