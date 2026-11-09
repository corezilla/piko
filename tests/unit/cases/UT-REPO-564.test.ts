/**
 * Case ID: UT-REPO-564  ·  STATUS: real
 *
 * 责任：分支 L698 `if (value.cost && typeof value.input === "num…`（if；store.ts）
 * 维度坐标：`rawUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-564.md（脚本的唯一依据）
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

describe("UT-REPO-564 · rawUsage · 状态分支 × 合法迁移", () => {

  it("folds cache tokens into input only for a priced, self-consistent record", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:698 的分支（if）取真的输入——带 cost 且 totalTokens 自洽的记录
      accept(store, task("t-564"));
      store.reserveModel("t-564", "op", "step", 1);
      store.observeUsage("t-564", "op", "step", 1, {
        cost: 0.5,
        input: 10,
        output: 5,
        totalTokens: 20,
        cacheRead: 2,
        cacheWrite: 3,
      });

      // 步骤 2：调用 rawUsage(…) 并断言该侧可观测结果
      const priced = store.rawUsage("t-564");

      // 步骤 3：断言取真侧——input 被折成 input+cacheRead+cacheWrite
      expect(priced).toHaveLength(1);
      expect(priced[0].input).toBe(15);
      expect(priced[0].output).toBe(5);
      expect(priced[0].totalTokens).toBe(20);

      // 步骤 4：断言取假侧——无 cost 的记录原样返回，input 不被折叠
      store.reserveModel("t-564", "op2", "step2", 2);
      store.observeUsage("t-564", "op2", "step2", 2, rawUsageSample());
      const plain = store.rawUsage("t-564");
      expect(plain).toHaveLength(2);
      expect(plain[1].input).toBe(10);
    } finally {
      store.close();
    }
  });

});
