/**
 * Case ID: UT-REPO-556  ·  STATUS: real
 *
 * 责任：分支 L686 `v.totalTokens ?? 0`（??；store.ts）
 * 维度坐标：`usageSoFar` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-556.md（脚本的唯一依据）
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

describe("UT-REPO-556 · usageSoFar · 状态分支 × 合法迁移", () => {

  it("treats a missing totalTokens as zero while still counting input and output", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:686 的分支（??：`v.totalTokens ?? 0`）取真的输入——记录里没有 totalTokens
      accept(store, task("t-556"));
      store.reserveModel("t-556", "op", "step", 1);
      store.observeUsage("t-556", "op", "step", 1, { input: 5, output: 6 });

      // 步骤 2：调用 usageSoFar(…) 并断言该侧可观测结果
      const usage = (store as any).usageSoFar("t-556");

      // 步骤 3：断言取真侧——totalTokens 缺省按 0 计，input/output 照常累加
      expect(usage).toEqual({ input_tokens: 5, output_tokens: 6, total_tokens: 0 });

      // 步骤 4：断言取假侧——带 totalTokens 的记录按其值累加
      store.reserveModel("t-556", "op2", "step2", 2);
      store.observeUsage("t-556", "op2", "step2", 2, rawUsageSample());
      const after = (store as any).usageSoFar("t-556");
      expect(after).toEqual({ input_tokens: 15, output_tokens: 11, total_tokens: 15 });
    } finally {
      store.close();
    }
  });

});
