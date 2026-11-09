/**
 * Case ID: UT-REPO-374  ·  STATUS: real
 *
 * 责任：参数 `status: number | null` 的 `+1 拒绝` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-374.md（脚本的唯一依据）
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

describe("UT-REPO-374 · recordProviderCall · 数值/长度上限参数 × +1 拒绝", () => {

  it("accepts a status one past the HTTP success range without a cap", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `+1 拒绝` 类构造 status——边界值取 599+1=600；其余参数取合法等价类
      accept(store, task("t-374"));

      // 步骤 2：调用 recordProviderCall(…)
      store.recordProviderCall("t-374", "op-1", 600, "req-1", "note", 10);

      // 步骤 3：断言——实现的真实语义：provider_calls.status 无范围校验（列类型 INTEGER），
      // 600 原样落库，不抛错
      const row = store.db.prepare("SELECT status FROM provider_calls").get() as any;
      expect(row.status).toBe(600);
      expect((store.db.prepare("SELECT count(*) n FROM provider_calls").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
