/**
 * Case ID: UT-REPO-583  ·  STATUS: real
 *
 * 责任：参数 `result: AgentResult` 的 `边界(上/下/零/空/满)` 类（store.ts:737）
 * 维度坐标：`insertResult` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-583.md（脚本的唯一依据）
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

describe("UT-REPO-583 · insertResult · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {

  it("accepts boundary result payloads and rejects invalid usage before writing", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `边界(上/下/零/空/满)` 类构造参数 result——下界：空 summary／空 outputs、generation 0；上界：批量输出
      accept(store, task("t1"));
      accept(store, task("t2"));
      const insert = (store as any).insertResult.bind(store);
      const manyOutputs = Array.from({ length: 50 }, (_, i) => ({ path: `p${i}`, sha256: "s", size_bytes: i }));

      // 步骤 2：调用 insertResult(…)
      insert(result("t1", { generation: 0, summary: "", outputs: [] }));
      const stored = store.db.prepare("SELECT result_json FROM results WHERE task_id='t1'").get() as any;
      expect(JSON.parse(stored.result_json).summary).toBe("");
      expect(JSON.parse(stored.result_json).outputs).toEqual([]);
      expect(JSON.parse(stored.result_json).generation).toBe(0);

      // 步骤 3：断言：被接受时返回值/状态与设计声明一致，逐值对账
      //         实现的真实语义：insertResult 先 validateUsage，用量不合法时在写库前就抛错；
      //         结果表每个 task 只允许一行（task_id 是主键），同任务的第二条结果被 UNIQUE 约束拒绝
      const badUsage: any = { ...result("t1").usage, input_tokens: null, missing_fields: [] };
      let err: any = null;
      try {
        insert(result("t1", { generation: 1, usage: badUsage }));
      } catch (e) {
        err = e;
      }
      expect(err).not.toBeNull();
      expect(err.message).toContain("usage missing mismatch: input_tokens");
      // 失败的那次没有留下任何行
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);
      expect((store.db.prepare("SELECT generation FROM results WHERE task_id='t1'").get() as any).generation).toBe(0);
      // 上界：批量输出可以整批入库（换一个任务，避免撞主键）
      insert(result("t2", { generation: 1, outputs: manyOutputs }));
      const full = store.db.prepare("SELECT result_json FROM results WHERE task_id='t2'").get() as any;
      expect(JSON.parse(full.result_json).outputs).toHaveLength(50);
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(2);
      // 同任务的第二条结果被 UNIQUE 约束拒绝
      let dupErr: any = null;
      try {
        insert(result("t2", { generation: 2, summary: "second" }));
      } catch (e) {
        dupErr = e;
      }
      expect(dupErr).not.toBeNull();
      expect(dupErr.message).toContain("UNIQUE constraint failed: results.task_id");
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(2);
    } finally {
      store.close();
    }
  });

});
