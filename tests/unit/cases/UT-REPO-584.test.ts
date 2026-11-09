/**
 * Case ID: UT-REPO-584  ·  STATUS: real
 *
 * 责任：参数 `result: AgentResult` 的 `非法值` 类（store.ts:737）
 * 维度坐标：`insertResult` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-584.md（脚本的唯一依据）
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

describe("UT-REPO-584 · insertResult · 纯函数/无副作用 × 非法值", () => {

  it("refuses a result whose usage violates the token contract and stores nothing", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `非法值` 类构造 result——usage 的 total 与 input+output 不符
      accept(store, task("t-584"));
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

      // 步骤 2：调用 insertResult(…)
      let err: any = null;
      try {
        (store as any).insertResult(result("t-584", { usage: badUsage }));
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言——实现的真实语义：insertResult 先跑 validateUsage，
      // 非法 usage 在写库前被拒（原生 Error，非 PikoError），results 表不留行
      expect(err).toBeInstanceOf(Error);
      expect(String((err as Error).message)).toContain("usage total mismatch");
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);

      // 对照：合法 usage 写入成功
      (store as any).insertResult(result("t-584"));
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
