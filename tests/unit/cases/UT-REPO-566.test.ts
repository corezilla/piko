/**
 * Case ID: UT-REPO-566  ·  STATUS: real
 *
 * 责任：分支 L699 `value.cost && typeof value.input === "number"`（&&；store.ts）
 * 维度坐标：`rawUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-566.md（脚本的唯一依据）
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

describe("UT-REPO-566 · rawUsage · 状态分支 × 合法迁移", () => {

  it("rewrites the input total only when the cost record adds up", async () => {
    const store = newStore();
    try {
      accept(store, task("t-566"));
      store.reserveModel("t-566", "op-566", "step-consistent", 1);
      store.observeUsage("t-566", "op-566", "step-consistent", 1, {
        input: 10,
        output: 5,
        totalTokens: 20,
        cacheRead: 3,
        cacheWrite: 2,
        cost: 0.5,
      });
      store.reserveModel("t-566", "op-566", "step-inconsistent", 1);
      store.observeUsage("t-566", "op-566", "step-inconsistent", 1, {
        input: 10,
        output: 5,
        totalTokens: 99,
        cacheRead: 3,
        cacheWrite: 2,
        cost: 0.5,
      });

      // 步骤 1：构造使 store.ts:699 的分支（&&）取真的输入——cost 存在且四个数字字段齐全、
      //         totalTokens 与 input+output+cacheRead+cacheWrite 相等
      // 步骤 2：调用 rawUsage(…) 并断言该侧可观测结果
      const raw = store.rawUsage("t-566");

      // 步骤 3：构造使该分支取假的输入——totalTokens 与各分项之和对不上
      // 步骤 4：再次调用 rawUsage(…) 并断言取假侧结果（两侧都被观测到）
      // 断言：自洽的那条被改写成 input=15（10+3+2）；不自洽的那条原样返回 input=10
      expect(raw).toEqual([
        { input: 15, output: 5, totalTokens: 20, cacheRead: 3, cacheWrite: 2, cost: 0.5 },
        { input: 10, output: 5, totalTokens: 99, cacheRead: 3, cacheWrite: 2, cost: 0.5 },
      ]);
    } finally {
      store.close();
    }
  });

});
