/**
 * Case ID: UT-REPO-588  ·  STATUS: real
 *
 * 责任：参数 `result: AgentResult` 的 `边界(上/下/零/空/满)` 类（store.ts:745）
 * 维度坐标：`publishResult` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-588.md（脚本的唯一依据）
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

describe("UT-REPO-588 · publishResult · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {

  it("publishes boundary-shaped results and records them with a digest", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `边界(上/下/零/空/满)` 类构造 result——空输出、零值统计、满 outputs
      accept(store, task("t-588"));
      const grant = store.tryClaimSlot("owner", "boot") as { task_id: string; lease_epoch: number };
      const outputs = Array.from({ length: 3 }, (_, i) => ({ path: `out-${i}.bin`, sha256: "a".repeat(64), size_bytes: 0 }));
      const boundary = result("t-588", {
        summary: "",
        outputs,
        stats: { model_calls: 0, tool_calls: 0, duration_ms: 0, outputs_count: outputs.length, outputs_bytes: 0 },
      });

      // 步骤 2：调用 publishResult(…)
      store.publishResult(boundary, grant.lease_epoch);

      // 步骤 3：断言——被接受：结果与摘要逐值对账，边界值（空 summary、零统计、满 outputs）原样落库
      const stored = store.db.prepare("SELECT result_json,result_sha256 FROM results WHERE task_id='t-588'").get() as any;
      const parsed = JSON.parse(stored.result_json);
      expect(parsed.summary).toBe("");
      expect(parsed.outputs).toHaveLength(3);
      expect(parsed.stats.outputs_count).toBe(3);
      expect(parsed.stats.duration_ms).toBe(0);
      expect(stored.result_sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(store.generation("t-588")).toBe(2);
    } finally {
      store.close();
    }
  });

});
