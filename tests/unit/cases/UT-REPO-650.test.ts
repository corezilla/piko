/**
 * Case ID: UT-REPO-650  ·  STATUS: real
 *
 * 责任：参数 `store: TaskStore` 的 `边界(上/下/零/空/满)` 类（store.ts:855）
 * 维度坐标：`asReader` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-650.md（脚本的唯一依据）
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

describe("UT-REPO-650 · asReader · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {

  it("exposes exactly the eight read-only members and no write handle", async () => {
    const store = newStore();
    try {
      accept(store, task("t-650"));
      store.reserveModel("t-650", "op-650", "step-650", 1);
      store.observeUsage("t-650", "op-650", "step-650", 1, { input: 3, output: 1, totalTokens: 4 });

      // 步骤 1：按 `边界(上/下/零/空/满)` 类构造参数 store——真实存在的内存库
      // 步骤 2：调用 asReader(…)
      const reader = asReader(store);

      // 步骤 3：断言逐值对账——reader 恰好暴露 8 个方法，且不泄露 db 写句柄；
      //         每个方法都绑定到该 store，读得到真实事实
      expect(Object.keys(reader).sort()).toEqual([
        "cancelRequested",
        "discussionAccessLost",
        "generation",
        "getRun",
        "getTask",
        "knownActions",
        "pendingTurns",
        "rawUsage",
      ]);
      expect("db" in (reader as unknown as Record<string, unknown>)).toBe(false);
      expect(reader.getTask("t-650").task_id).toBe("t-650");
      expect(reader.getRun("t-650").state).toBe("Queued");
      expect(reader.generation("t-650")).toBe(1);
      expect(reader.cancelRequested("t-650")).toBe(false);
      expect(reader.pendingTurns("t-650")).toEqual([]);
      expect(reader.rawUsage("t-650")).toEqual([{ input: 3, output: 1, totalTokens: 4 }]);
      expect(reader.knownActions("t-650")).toHaveLength(1);
      expect(reader.discussionAccessLost("t-650")).toBe(false);
    } finally {
      store.close();
    }
  });

});
