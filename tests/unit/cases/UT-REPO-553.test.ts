/**
 * Case ID: UT-REPO-553  ·  STATUS: real
 *
 * 责任：分支 L682 `loop (rows)`（loop；store.ts）
 * 维度坐标：`usageSoFar` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-553.md（脚本的唯一依据）
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

describe("UT-REPO-553 · usageSoFar · 状态分支 × 合法迁移", () => {
  it("sums every observed usage row in the loop and skips the loop entirely when there is none", async () => {
    const store = newStore();
    try {
      accept(store, task("t-553"));

      // 步骤 1：构造使 store.ts:682 的分支（loop：`loop (rows)`）取真的输入——
      //         两条已观测用量的 model_attempt
      store.reserveModel("t-553", "op-1", "s-1", 1);
      store.observeUsage("t-553", "op-1", "s-1", 1, rawUsageSample({ input: 10, output: 5, totalTokens: 15 }));
      store.reserveModel("t-553", "op-2", "s-2", 1);
      store.observeUsage("t-553", "op-2", "s-2", 1, rawUsageSample({ input: 100, output: 50, totalTokens: 150 }));

      // 步骤 2：调用 usageSoFar(…) 并断言该侧可观测结果（返回值/状态/副作用）与设计一致
      //         usageSoFar 是私有的，实现对外只经 getRun().progress.usage_so_far 暴露
      const looped = (store.getRun("t-553") as any).progress.usage_so_far;
      expect(looped).toEqual({ input_tokens: 110, output_tokens: 55, total_tokens: 165 });

      // 步骤 3：构造使该分支取假的输入——清空已观测的用量行，循环体一次都不执行
      //         （无显式 else：取假即跳过该块，断言块内副作用不发生）
      store.db.prepare("UPDATE model_attempts SET raw_usage_json=NULL WHERE task_id='t-553'").run();

      // 步骤 4：再次调用 usageSoFar(…) 并断言取假侧结果；两侧都必须被观测到
      const skipped = (store.getRun("t-553") as any).progress.usage_so_far;
      expect(skipped).toEqual({ input_tokens: null, output_tokens: null, total_tokens: null });
      // 取假侧无副作用：循环体里的累加没有发生，也没有写入任何行
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts WHERE raw_usage_json IS NOT NULL").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(2);
    } finally {
      store.close();
    }
  });

});
