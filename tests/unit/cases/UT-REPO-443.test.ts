/**
 * Case ID: UT-REPO-443  ·  STATUS: real
 *
 * 责任：参数 `cursor: string` 的 `注入字符` 类（store.ts:547）
 * 维度坐标：`ingestMatrixBatch` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-443.md（脚本的唯一依据）
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

describe("UT-REPO-443 · ingestMatrixBatch · 字符串/路径/枚举输入 × 注入字符", () => {
  it("stores an injection-shaped cursor verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 cursor——SQL 注入串、路径穿越串、控制字符串
      acceptDiscussion(store, "d1", "!r");
      const cursor = "'; DROP TABLE runs;--";
      // 步骤 2：调用 ingestMatrixBatch
            const n = store.ingestMatrixBatch([], cursor);
            const got = store.matrixCursor();
      // 步骤 3：断言——参数化绑定：注入串只作为 cursor 字面量，runs 表不受影响
            expect(n).toBe(0);
            expect(got).toBe(cursor);
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
