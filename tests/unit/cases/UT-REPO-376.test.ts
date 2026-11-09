/**
 * Case ID: UT-REPO-376  ·  STATUS: real
 *
 * 责任：参数 `requestId: string | null` 的 `空` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-376.md（脚本的唯一依据）
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

describe("UT-REPO-376 · recordProviderCall · 字符串/路径/枚举输入 × 空", () => {

  it("stores an empty request id as an empty string and a null one as SQL NULL", async () => {
    const store = newStore();
    try {
      accept(store, task("t-376"));

      // 步骤 1：按 `空` 类构造参数 requestId——''（空串）、undefined（缺省）、null（显式空值）
      // 步骤 2：调用 recordProviderCall(…)
      store.recordProviderCall("t-376", "op-empty", 200, "", "note", 1);
      store.recordProviderCall("t-376", "op-null", 200, null, "note", 1);
      let undefinedErr: any = null;
      try {
        store.recordProviderCall("t-376", "op-undef", 200, undefined as unknown as string, "note", 1);
      } catch (e) {
        undefinedErr = e;
      }

      // 步骤 3：断言——实现的真实语义：空串是合法的非空 request_id，原样落库；
      //         null 落成 SQL NULL；undefined 被绑定层拒绝（TypeError）
      expect(undefinedErr?.constructor?.name).toBe("TypeError");
      expect(undefinedErr?.message).toMatch(/cannot be bound to SQLite parameter/);
      const rows = store.db.prepare(
        "SELECT operation_id,request_id,typeof(request_id) t FROM provider_calls ORDER BY operation_id",
      ).all() as any[];
      expect(rows).toEqual([
        { operation_id: "op-empty", request_id: "", t: "text" },
        { operation_id: "op-null", request_id: null, t: "null" },
      ]);
    } finally {
      store.close();
    }
  });

});
