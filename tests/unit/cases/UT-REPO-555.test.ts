/**
 * Case ID: UT-REPO-555  ·  STATUS: real
 *
 * 责任：分支 L685 `v.output ?? 0`（??；store.ts）
 * 维度坐标：`usageSoFar` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-555.md（脚本的唯一依据）
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

describe("UT-REPO-555 · usageSoFar · 状态分支 × 合法迁移", () => {

  it("treats a missing output field as zero and sums the present one", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:685 的分支取真的输入——v.output 为 undefined（?? 的左值缺失）
      accept(store, task("t1"));
      store.reserveModel("t1", "op", "s1", 1);
      store.observeUsage("t1", "op", "s1", 1, { input: 10, totalTokens: 10 });

      // 步骤 2：调用 usageSoFar(…) 并断言该侧可观测结果（返回值/状态/副作用）与设计一致
      const missing = (store.getRun("t1") as any).progress.usage_so_far;
      expect(missing.output_tokens).toBe(0);

      // 步骤 3：构造使该分支取假的输入——v.output 有值（无显式 else：取假即跳过该块，断言块内副作用不发生）
      store.reserveModel("t1", "op", "s2", 2);
      store.observeUsage("t1", "op", "s2", 2, { input: 5, output: 7, totalTokens: 12 });

      // 步骤 4：再次调用 usageSoFar(…) 并断言取假侧结果；两侧都必须被观测到
      const present = (store.getRun("t1") as any).progress.usage_so_far;
      expect(present.output_tokens).toBe(7);
      expect(present.input_tokens).toBe(15);
      expect(present.total_tokens).toBe(22);
    } finally {
      store.close();
    }
  });

});
