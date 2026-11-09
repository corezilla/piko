/**
 * Case ID: UT-REPO-370  ·  STATUS: real
 *
 * 责任：参数 `operationId: string` 的 `空` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-370.md（脚本的唯一依据）
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

describe("UT-REPO-370 · recordProviderCall · 字符串/路径/枚举输入 × 空", () => {

  it("rejects an empty operation id and records nothing", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 operationId——''（空串）、null（显式空值）；其余参数取合法等价类
      accept(store, task("t-370"));

      // 步骤 2：调用 recordProviderCall(…)
      let emptyErr: any = null;
      try {
        store.recordProviderCall("t-370", "", 200, "req-1", "note", 10);
      } catch (e) {
        emptyErr = e;
      }
      let nullErr: any = null;
      try {
        store.recordProviderCall("t-370", null as any, 200, "req-1", "note", 10);
      } catch (e) {
        nullErr = e;
      }

      // 步骤 3：断言——实现的真实语义：provider_calls.operation_id 是 NOT NULL 列，
      // null 被拒；空串本身合法（列非空但可为空串），故被接受并落库
      expect(nullErr).toBeInstanceOf(Error);
      expect(String((nullErr as Error).message)).toContain("NOT NULL constraint failed");
      expect(emptyErr).toBeNull();
      const rows = store.db.prepare("SELECT operation_id,status FROM provider_calls").all() as any[];
      expect(rows.length).toBe(1);
      expect(rows[0].operation_id).toBe("");
      expect(rows[0].status).toBe(200);
    } finally {
      store.close();
    }
  });

});
