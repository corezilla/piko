/**
 * Case ID: UT-REPO-134  ·  STATUS: real
 *
 * 责任：参数 `staging: InputStaging` 的 `边界(上/下/零/空/满)` 类（store.ts:288）
 * 维度坐标：`setInputStaging` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-134.md（脚本的唯一依据）
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

describe("UT-REPO-134 · setInputStaging · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts boundary-shaped InputStaging payloads", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `边界(上/下/零/空/满)` 类构造 staging——空数组、零条目、单条目、满载（1000 条）
      accept(store, task("t1"));
      const full = {
              state: "pending" as const,
              fetched: Array.from({ length: 1000 }, (_, i) => ({ source: "s" + i })),
              failed: Array.from({ length: 1000 }, (_, i) => ({ source: "f" + i, error: "e" + i })),
            };
      // 步骤 2：调用 setInputStaging（空 → 满）
            store.setInputStaging("t1", { state: "none", fetched: [], failed: [] });
            const empty = store.inputStaging("t1");
            store.setInputStaging("t1", full);
            const loaded = store.inputStaging("t1");
      // 步骤 3：断言逐值对账
            expect(empty).toEqual({ state: "none", fetched: [], failed: [] });
            expect(loaded.state).toBe("pending");
            expect(loaded.fetched.length).toBe(1000);
            expect(loaded.failed.length).toBe(1000);
            expect(loaded.fetched[999]).toEqual({ source: "s999" });
            expect(loaded.failed[999]).toEqual({ source: "f999", error: "e999" });
    } finally {
      store.close();
    }
  });

});
