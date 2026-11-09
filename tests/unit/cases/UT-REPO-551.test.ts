/**
 * Case ID: UT-REPO-551  ·  STATUS: real
 *
 * 责任：分支 L676 `if (!rows.length)`（if；store.ts）
 * 维度坐标：`usageSoFar` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-551.md（脚本的唯一依据）
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

describe("UT-REPO-551 · usageSoFar · 状态分支 × 合法迁移", () => {

  it("returns the null triple when no usage was observed and the summed triple otherwise", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:676 的分支取真的输入——还没有任何 raw_usage_json 的 model_attempt
      accept(store, task("t1"));
      store.reserveModel("t1", "op", "s1", 1);

      // 步骤 2：调用 usageSoFar(…) 并断言该侧可观测结果（返回值/状态/副作用）与设计一致
      //         usageSoFar 是私有的，实现对外只经 getRun().progress.usage_so_far 暴露
      const empty = (store.getRun("t1") as any).progress.usage_so_far;
      expect(empty).toEqual({ input_tokens: null, output_tokens: null, total_tokens: null });

      // 步骤 3：构造使该分支取假的输入——存在一条已观测用量的 model_attempt（无显式 else：取假即跳过该块，断言块内副作用不发生）
      store.observeUsage("t1", "op", "s1", 1, rawUsageSample());

      // 步骤 4：再次调用 usageSoFar(…) 并断言取假侧结果；两侧都必须被观测到
      const filled = (store.getRun("t1") as any).progress.usage_so_far;
      expect(filled).toEqual({ input_tokens: 10, output_tokens: 5, total_tokens: 15 });
      // 取假侧无副作用：usageSoFar 是只读聚合
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
