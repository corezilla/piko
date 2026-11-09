/**
 * Case ID: UT-REPO-616  ·  STATUS: real
 *
 * 责任：参数 `result: AgentResult` 的 `非法值` 类（store.ts:780）
 * 维度坐标：`finishQueued` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-616.md（脚本的唯一依据）
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
import { PikoError } from "../../../src/types.js";

describe("UT-REPO-616 · finishQueued · 纯函数/无副作用 × 非法值", () => {

  it("refuses a result with an invalid usage and leaves the run queued", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `非法值` 类构造 result——usage 的 total 与 input+output 不符
      accept(store, task("t-616"));
      const badUsage = {
        source: "PiModelResponses",
        quality: "Complete",
        input_tokens: 10,
        output_tokens: 5,
        total_tokens: 99,
        cache_read_tokens: 0,
        cache_write_tokens: 0,
        reasoning_tokens: 0,
        model_attempts: 0,
        usage_observed_attempts: 0,
        missing_fields: [],
      } as any;

      // 步骤 2：调用 finishQueued(…)
      let err: any = null;
      try {
        store.finishQueued(result("t-616", { usage: badUsage }));
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言——实现的真实语义：finishQueued 先调 insertResult（其内 validateUsage），
      // 非法 usage 被拒（原生 Error，非 PikoError）；事务回滚，run 仍 Queued、无结果行
      expect(err).toBeInstanceOf(Error);
      expect(String((err as Error).message)).toContain("usage total mismatch");
      expect(store.getRun("t-616").state).toBe("Queued");
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
