/**
 * Case ID: UT-REPO-565  ·  STATUS: real
 *
 * 责任：分支 L699 `value.cost && typeof value.input === "number"…`（&&；store.ts）
 * 维度坐标：`rawUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-565.md（脚本的唯一依据）
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

describe("UT-REPO-565 · rawUsage · 状态分支 × 合法迁移", () => {
  it("folds the cache tokens into input when the cost guard holds and returns the value untouched otherwise", async () => {
    const store = newStore();
    try {
      accept(store, task("t-565"));

      // 步骤 1：构造使 store.ts:699 的分支（&&：`value.cost && typeof value.input === \"number\" …`）
      //         取真的输入——cost 存在、四个计数字段都是 number、totalTokens 自洽
      store.reserveModel("t-565", "op-1", "s-1", 1);
      store.observeUsage("t-565", "op-1", "s-1", 1, {
        input: 1,
        output: 1,
        totalTokens: 7,
        cacheRead: 2,
        cacheWrite: 3,
        cost: 0.5,
      });

      // 步骤 2：调用 rawUsage(…) 并断言该侧可观测结果
      const folded = store.rawUsage("t-565");
      expect(folded).toEqual([{ input: 6, output: 1, totalTokens: 7, cacheRead: 2, cacheWrite: 3, cost: 0.5 }]);

      // 步骤 3：构造使该分支取假的输入——totalTokens 与 input+output+cache 不自洽，&& 短路
      store.reserveModel("t-565", "op-2", "s-2", 1);
      store.observeUsage("t-565", "op-2", "s-2", 1, {
        input: 10,
        output: 5,
        totalTokens: 99,
        cacheRead: 0,
        cacheWrite: 0,
        cost: 0.5,
      });

      // 步骤 4：再次调用 rawUsage(…) 并断言取假侧结果；两侧都必须被观测到
      const untouched = store.rawUsage("t-565");
      expect(untouched).toEqual([
        { input: 6, output: 1, totalTokens: 7, cacheRead: 2, cacheWrite: 3, cost: 0.5 },
        { input: 10, output: 5, totalTokens: 99, cacheRead: 0, cacheWrite: 0, cost: 0.5 },
      ]);
      // 取真侧：input 被折叠为 1 + 2 + 3 = 6；取假侧：input 原样保持 10
      expect(untouched[1].input).toBe(10);
      expect(untouched[1].totalTokens).toBe(99);
    } finally {
      store.close();
    }
  });

});
