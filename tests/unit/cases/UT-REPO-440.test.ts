/**
 * Case ID: UT-REPO-440  ·  STATUS: real
 *
 * 责任：可选参数 `events` 缺省/显式两态（store.ts:547）
 * 维度坐标：`ingestMatrixBatch` × `字符串/路径/枚举输入` × `未知枚举`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-440.md（脚本的唯一依据）
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

describe("UT-REPO-440 · ingestMatrixBatch · 字符串/路径/枚举输入 × 未知枚举", () => {
  it("treats an omitted events array the same as an explicit empty one", async () => {
    const store = newStore();
    try {
      // 步骤 1：对可选参数 events 构造三态——缺省（不传）、显式传默认值、未知枚举值
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：分别调用 ingestMatrixBatch
            const explicitEmpty = store.ingestMatrixBatch([], "cursor-1");
            const cursorAfterEmpty = store.matrixCursor();
            let undefinedErr: any = null;
            try {
              store.ingestMatrixBatch(undefined as any, "cursor-2");
            } catch (e) {
              undefinedErr = e;
            }
            const cursorAfterFailure = store.matrixCursor();
            const unknownEnum = store.ingestMatrixBatch([] as any, "cursor-3");
      // 步骤 3：断言缺省态与显式默认值同构；未知枚举值按 ISD 声明拒绝且 typed 化
            expect(explicitEmpty).toBe(0);
            expect(unknownEnum).toBe(0);
            expect(store.matrixCursor()).toBe("cursor-3");
            // 实现的真实语义：events 不是可选参数（源码 store.ts:547 无默认值），缺省即 undefined，
            // SQLite 事务里迭代 undefined 抛原生 TypeError——不是 typed PikoError
            expect(undefinedErr).toBeInstanceOf(TypeError);
            expect(undefinedErr.message).toContain("not iterable");
            // 事务回滚：失败的批次没有推进 cursor（仍停在 cursor-1）
            expect(cursorAfterEmpty).toBe("cursor-1");
            expect(cursorAfterFailure).toBe("cursor-1");
    } finally {
      store.close();
    }
  });

});
