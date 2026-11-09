/**
 * Case ID: UT-REPO-375  ·  STATUS: real
 *
 * 责任：参数 `status: number | null` 的 `−1 通过` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-375.md（脚本的唯一依据）
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

describe("UT-REPO-375 · recordProviderCall · 数值/长度上限参数 × −1 通过", () => {
  it("accepts a status of minus one and stores it verbatim", async () => {
    const store = newStore();
    try {
      accept(store, task("t-375"));

      // 步骤 1：按 `−1 通过` 类构造参数 status——边界值 −1；其余参数取合法等价类
      // 步骤 2：调用 recordProviderCall(…)
      store.recordProviderCall("t-375", "op-1", -1, "req-1", "note", 0);

      // 步骤 3：断言——实现的真实语义：status 列没有任何取值约束（也没有 CHECK），
      //         所以 −1 原样通过并原样落库；对照的 null 也照样落成 SQL NULL
      const row = store.db.prepare("SELECT status, latency_ms FROM provider_calls").get() as any;
      expect(row.status).toBe(-1);
      expect(typeof row.status).toBe("number");
      expect(row.latency_ms).toBe(0);
      store.recordProviderCall("t-375", "op-2", null, "req-2", "note", null);
      const rows = store.db.prepare("SELECT status, latency_ms FROM provider_calls ORDER BY operation_id").all() as any[];
      expect(rows.map((r) => [r.status, r.latency_ms])).toEqual([
        [-1, 0],
        [null, null],
      ]);
    } finally {
      store.close();
    }
  });

});
