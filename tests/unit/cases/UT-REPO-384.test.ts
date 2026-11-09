/**
 * Case ID: UT-REPO-384  ·  STATUS: real
 *
 * 责任：参数 `latencyMs: number | null` 的 `−1 通过` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-384.md（脚本的唯一依据）
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

describe("UT-REPO-384 · recordProviderCall · 数值/长度上限参数 × −1 通过", () => {

  it("accepts a negative latency and stores it as-is", async () => {
    const store = newStore();
    try {
      accept(store, task("t-384"));

      // 步骤 1：按 `−1 通过` 类构造参数 latencyMs——边界值 −1
      // 步骤 2：调用 recordProviderCall(…)
      store.recordProviderCall("t-384", "op-384", 200, "req-384", "note", -1);

      // 步骤 3：断言逐值对账——实现对 latency_ms 没有下界校验：−1 原样落库
      const row = store.db.prepare("SELECT latency_ms FROM provider_calls").get() as any;
      expect(row.latency_ms).toBe(-1);
      expect(store.db.prepare("SELECT count(*) n FROM provider_calls").get()).toEqual({ n: 1 });
    } finally {
      store.close();
    }
  });

});
