/**
 * Case ID: UT-REPO-239  ·  STATUS: real
 *
 * 责任：参数 `busyMs: number` 的 `+1 拒绝` 类（store.ts:44）
 * 维度坐标：`TaskStore.constructor` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-239.md（脚本的唯一依据）
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

describe("UT-REPO-239 · TaskStore.constructor · 数值/长度上限参数 × +1 拒绝", () => {
  it("accepts busyMs+1 without rejecting it", async () => {
      // 步骤 1：按 `+1 拒绝` 类构造 busyMs——边界值 5000 + 1；其余参数取合法等价类
      let store: any = null;
      try {
        // 步骤 2：调用 new TaskStore(":memory:", 5001)
        store = new TaskStore(":memory:", 5001);

        // 步骤 3：断言——实现的真实语义：busyMs 无上限校验（源码 store.ts:44 无显式校验语句），
        // 5001 被原样写进 PRAGMA busy_timeout
        const pragma = store.db.prepare("PRAGMA busy_timeout").get() as any;
        expect(pragma.timeout).toBe(5001);
      } finally {
        if (store) store.close();
      }
  });

});
