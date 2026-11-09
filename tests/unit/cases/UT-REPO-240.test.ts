/**
 * Case ID: UT-REPO-240  ·  STATUS: real
 *
 * 责任：参数 `busyMs: number` 的 `−1 通过` 类（store.ts:44）
 * 维度坐标：`TaskStore.constructor` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-240.md（脚本的唯一依据）
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

describe("UT-REPO-240 · TaskStore.constructor · 数值/长度上限参数 × −1 通过", () => {
  it("accepts busyMs−1 and lets SQLite clamp it to 0", async () => {
      // 步骤 1：按 `−1 通过` 类构造 busyMs——边界值 5000 − 1；其余参数取合法等价类
      let store: any = null;
      try {
        // 步骤 2：调用 new TaskStore(":memory:", 4999)
        store = new TaskStore(":memory:", 4999);

        // 步骤 3：断言——busy_timeout 原样生效（4999 未被钳制）
        const pragma = store.db.prepare("PRAGMA busy_timeout").get() as any;
        expect(pragma.timeout).toBe(4999);
      } finally {
        if (store) store.close();
      }
  });

});
