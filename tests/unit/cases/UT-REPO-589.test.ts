/**
 * Case ID: UT-REPO-589  ·  STATUS: real
 *
 * 责任：参数 `result: AgentResult` 的 `非法值` 类（store.ts:745）
 * 维度坐标：`publishResult` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-589.md（脚本的唯一依据）
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

describe("UT-REPO-589 · publishResult · 纯函数/无副作用 × 非法值", () => {
  it("rejects an illegal result whose usage breaks the token contract and writes nothing", async () => {
    const store = newStore();
    try {
      accept(store, task("t-589"));
      const grant = store.tryClaimSlot("owner-589", "boot-589") as { lease_epoch: number };

      // 步骤 1：按 `非法值` 类构造参数 result——usage 的 total 与 input+output 不符（等价类之一）
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
      } as never;
      // 另一等价类：usage 字段整个缺失
      const noUsage = { ...result("t-589") } as any;
      delete noUsage.usage;

      // 步骤 2：调用 publishResult(…)
      let usageErr: any = null;
      try {
        store.publishResult(result("t-589", { usage: badUsage }), grant.lease_epoch);
      } catch (e) {
        usageErr = e;
      }
      let missingErr: any = null;
      try {
        store.publishResult(noUsage, grant.lease_epoch);
      } catch (e) {
        missingErr = e;
      }

      // 步骤 3：断言——实现的真实语义：publishResult 先过 lease 守卫，再由 insertResult
      //         跑 validateUsage；非法 usage 在写库前被拒（原生 Error，非 PikoError），
      //         results 表不留行，generation 也不递增
      expect(usageErr).toBeInstanceOf(Error);
      expect(usageErr?.code).toBeUndefined();
      expect(String(usageErr?.message)).toContain("usage total mismatch");
      expect(missingErr).toBeInstanceOf(Error);
      expect(String(missingErr?.message)).toContain("usage");
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT generation FROM runs WHERE task_id='t-589'").get() as any).generation).toBe(1);
    } finally {
      store.close();
    }
  });

});
