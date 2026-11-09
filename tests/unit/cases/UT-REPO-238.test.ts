/**
 * Case ID: UT-REPO-238  ·  STATUS: real
 *
 * 责任：参数 `busyMs: number` 的 `恰好通过` 类（store.ts:44）
 * 维度坐标：`TaskStore.constructor` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-238.md（脚本的唯一依据）
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

describe("UT-REPO-238 · TaskStore.constructor · 数值/长度上限参数 × 恰好通过", () => {
  it("applies the exact busyMs value it was given", async () => {
      // 步骤 1：按 `恰好通过` 类构造 busyMs——取一个确切的毫秒值；其余参数取合法等价类
      let store: any = null;
      try {
        // 步骤 2：调用 new TaskStore(":memory:", 5000)
        store = new TaskStore(":memory:", 5000);

        // 步骤 3：断言——busy_timeout 原样生效
        const pragma = store.db.prepare("PRAGMA busy_timeout").get() as any;
        expect(pragma.timeout).toBe(5000);
      } finally {
        if (store) store.close();
      }
  });

});
