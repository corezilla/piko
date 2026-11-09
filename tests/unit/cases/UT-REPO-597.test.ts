/**
 * Case ID: UT-REPO-597  ·  STATUS: real
 *
 * 责任：参数 `result: AgentResult` 的 `边界(上/下/零/空/满)` 类（store.ts:755）
 * 维度坐标：`finish` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-597.md（脚本的唯一依据）
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

describe("UT-REPO-597 · finish · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts the boundary result shapes and writes each of them through", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `边界(上/下/零/空/满)` 类构造参数 result——
      //         下界（generation=0）、零值（stats 全零、usage 全零）、空集合（outputs=[]）、
      //         满（25 个 outputs）
      accept(store, task("t-597-low"));
      let grant = store.tryClaimSlot("owner-597", "boot-597") as { lease_epoch: number };
      const low = result("t-597-low", {
        generation: 0,
        partial: true,
        summary: "",
        outputs: [],
        stats: { model_calls: 0, tool_calls: 0, duration_ms: 0, outputs_count: 0, outputs_bytes: 0 },
      });
      store.finish(low, grant.lease_epoch);

      accept(store, task("t-597-full"));
      grant = store.tryClaimSlot("owner-597", "boot-597") as { lease_epoch: number };
      const outputs = Array.from({ length: 25 }, (_, i) => ({ path: `/out/${i}.txt`, sha256: "a".repeat(64), size_bytes: i }));
      const full = result("t-597-full", { outputs, summary: "x".repeat(512) });
      store.finish(full, grant.lease_epoch);

      // 步骤 2：调用 finish(…)
      // 步骤 3：断言——被接受时返回值/状态与设计声明一致，逐值对账
      const lowRow = store.db.prepare("SELECT task_id,generation,result_json,published_at FROM results WHERE task_id='t-597-low'").get() as any;
      expect(lowRow.generation).toBe(0);
      expect(JSON.parse(lowRow.result_json).outputs).toEqual([]);
      expect(JSON.parse(lowRow.result_json).partial).toBe(true);
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='t-597-low'").get() as any).state).toBe("Completed");

      const fullRow = store.db.prepare("SELECT result_json FROM results WHERE task_id='t-597-full'").get() as any;
      const fullJson = JSON.parse(fullRow.result_json);
      expect(fullJson.outputs).toHaveLength(25);
      expect(fullJson.outputs[24]).toEqual({ path: "/out/24.txt", sha256: "a".repeat(64), size_bytes: 24 });
      expect(fullJson.summary.length).toBe(512);
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='t-597-full'").get() as any).state).toBe("Completed");
      // 两个边界结果都落库
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(2);
    } finally {
      store.close();
    }
  });

});
