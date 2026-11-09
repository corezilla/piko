/**
 * Case ID: UT-REPO-373  ·  STATUS: real
 *
 * 责任：参数 `status: number | null` 的 `恰好通过` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-373.md（脚本的唯一依据）
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

describe("UT-REPO-373 · recordProviderCall · 数值/长度上限参数 × 恰好通过", () => {

  it("accepts boundary status codes including null and 599", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `恰好通过` 类构造参数 status——边界值 0、599、null（源码无比较常量，取类型定义边界）；其余参数取合法等价类
      accept(store, task("t1"));

      // 步骤 2：调用 recordProviderCall(…)
      store.recordProviderCall("t1", "op-0", 0, "rid-0", "note", 0);
      store.recordProviderCall("t1", "op-599", 599, "rid-599", "note", 599);
      store.recordProviderCall("t1", "op-null", null, "rid-null", "note", null);

      // 步骤 3：断言：被接受时返回值/状态与设计声明一致，逐值对账
      const rows = store.db.prepare("SELECT operation_id, status, latency_ms FROM provider_calls ORDER BY operation_id").all() as any[];
      expect(rows.map((r) => [r.operation_id, r.status, r.latency_ms])).toEqual([
        ["op-0", 0, 0],
        ["op-599", 599, 599],
        ["op-null", null, null],
      ]);
    } finally {
      store.close();
    }
  });

});
