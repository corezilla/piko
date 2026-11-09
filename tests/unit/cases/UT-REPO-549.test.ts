/**
 * Case ID: UT-REPO-549  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:674）
 * 维度坐标：`usageSoFar` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-549.md（脚本的唯一依据）
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

describe("UT-REPO-549 · usageSoFar · 字符串/路径/枚举输入 × 超长", () => {
  it("returns the null triple for an over-long task id without rejecting it", async () => {
    const store = newStore();
    try {
      accept(store, task("t-549"));

      // 步骤 1：按 `超长` 类构造参数 taskId——源码里没有长度比较常量，取上限 4096 的 2 倍
      const longId = "t".repeat(8192);

      // 步骤 2：调用 usageSoFar(…)
      //         usageSoFar 是私有的，实现对外只经 getRun().progress.usage_so_far 暴露
      const usage = (store as any).usageSoFar(longId);

      // 步骤 3：断言——实现的真实语义：usageSoFar 对 taskId 零校验，
      //         超长 id 只是查不到行 → 空三元组，不抛 typed 错误
      expect(usage).toEqual({ input_tokens: null, output_tokens: null, total_tokens: null });
      expect(Object.keys(usage).sort()).toEqual(["input_tokens", "output_tokens", "total_tokens"]);
      // 无状态写
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
