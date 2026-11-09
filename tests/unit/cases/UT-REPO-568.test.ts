/**
 * Case ID: UT-REPO-568  ·  STATUS: real
 *
 * 责任：返回站点 L706 值 `{ ...value, input: value.input + value.…` 逐值断言（store.ts）
 * 维度坐标：`rawUsage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-568.md（脚本的唯一依据）
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

describe("UT-REPO-568 · rawUsage · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the spread record with the folded input value", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:706 的返回站点被到达的输入——满足 cost 分支的完整用量记录
      accept(store, task("t-568"));
      store.reserveModel("t-568", "op", "step", 1);
      store.observeUsage("t-568", "op", "step", 1, {
        cost: 1.25,
        input: 10,
        output: 5,
        totalTokens: 20,
        cacheRead: 2,
        cacheWrite: 3,
      });

      // 步骤 2：调用 rawUsage(…)
      const usage = store.rawUsage("t-568");

      // 步骤 3：断言返回值逐值对账——返回的是展开后的原记录，只有 input 被换成折叠值
      expect(usage).toHaveLength(1);
      expect(usage[0]).toEqual({
        cost: 1.25,
        input: 15,
        output: 5,
        totalTokens: 20,
        cacheRead: 2,
        cacheWrite: 3,
      });
      expect(Object.keys(usage[0]).sort()).toEqual(["cacheRead", "cacheWrite", "cost", "input", "output", "totalTokens"]);
    } finally {
      store.close();
    }
  });

});
