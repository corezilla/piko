/**
 * Case ID: UT-REPO-383  ·  STATUS: real
 *
 * 责任：参数 `latencyMs: number | null` 的 `+1 拒绝` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-383.md（脚本的唯一依据）
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

describe("UT-REPO-383 · recordProviderCall · 数值/长度上限参数 × +1 拒绝", () => {
  it("stores an integer latency verbatim and rejects a non-integer with the SQLite STRICT error", async () => {
    const store = newStore();
    try {
      accept(store, task("t-383"));

      // 步骤 1：按 `+1 拒绝` 类构造参数 latencyMs——store.ts:519 里没有上限比较常量，
      //         故取「合法整数的 +1」= 1 与「越到下一类表示」= 1.5（REAL、非整数）
      // 步骤 2：调用 recordProviderCall(…)
      store.recordProviderCall("t-383", "op-1", 200, "req-1", "note-1", 1);

      // 步骤 3：断言——实现的真实语义：recordProviderCall 对参数零校验，
      //         整数值原样落库；唯一的「拒绝」来自 STRICT 表的 INTEGER 列，
      //         非整数（REAL）在写库时被 SQLite 拒绝，且不留下任何行
      let err: any = null;
      try {
        store.recordProviderCall("t-383", "op-2", 200, "req-2", "note-2", 1.5);
      } catch (e) {
        err = e;
      }
      expect(err).toBeInstanceOf(Error);
      expect(String(err.message)).toContain("cannot store REAL value in INTEGER column provider_calls.latency_ms");
      expect((err as any).code).toBe("ERR_SQLITE_ERROR");
      const rows = store.db.prepare("SELECT operation_id,status,latency_ms FROM provider_calls ORDER BY operation_id").all() as any[];
      expect(rows).toEqual([{ operation_id: "op-1", status: 200, latency_ms: 1 }]);
    } finally {
      store.close();
    }
  });

});
