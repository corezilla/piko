/**
 * Case ID: UT-REPO-382  ·  STATUS: real
 *
 * 责任：参数 `latencyMs: number | null` 的 `恰好通过` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-382.md（脚本的唯一依据）
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

describe("UT-REPO-382 · recordProviderCall · 数值/长度上限参数 × 恰好通过", () => {

  it("accepts a zero latency at the boundary and stores it verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `恰好通过` 类构造 latencyMs——下边界 0；其余参数取合法等价类
      accept(store, task("t-382"));

      // 步骤 2：调用 recordProviderCall(…)
      store.recordProviderCall("t-382", "op-1", 200, "req-1", "note", 0);

      // 步骤 3：断言——被接受：实现的真实语义是 latencyMs 无边界校验，0 原样落库（非 NULL）
      const row = store.db.prepare("SELECT latency_ms FROM provider_calls").get() as any;
      expect(row.latency_ms).toBe(0);
      expect(row.latency_ms).not.toBeNull();
      expect((store.db.prepare("SELECT count(*) n FROM provider_calls").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
