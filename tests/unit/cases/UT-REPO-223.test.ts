/**
 * Case ID: UT-REPO-223  ·  STATUS: real
 *
 * 责任：参数 `step: string` 的 `空` 类（store.ts:431）
 * 维度坐标：`reserveModel` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-223.md（脚本的唯一依据）
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

describe("UT-REPO-223 · reserveModel · 字符串/路径/枚举输入 × 空", () => {

  it("accepts an empty step id, rejects null and refuses to bind undefined", async () => {
    const store = newStore();
    try {
      accept(store, task("t-223"));

      // 步骤 1：按 `空` 类构造参数 step——''（空串）、undefined（缺省）、null（显式空值）
      // 步骤 2：调用 reserveModel(…)
      expect(store.reserveModel("t-223", "op", "", 1)).toBe(true);
      let undefinedErr: any = null;
      try {
        store.reserveModel("t-223", "op", undefined as unknown as string, 1);
      } catch (e) {
        undefinedErr = e;
      }
      let nullErr: any = null;
      try {
        store.reserveModel("t-223", "op", null as unknown as string, 1);
      } catch (e) {
        nullErr = e;
      }

      // 步骤 3：断言——实现的真实语义：空串是合法的 step_id 并原样落库；
      //         undefined 被绑定层拒绝（TypeError），null 落进 NOT NULL 约束失败，
      //         两次失败都被 tx 回滚，计数没有多涨
      expect(undefinedErr?.constructor?.name).toBe("TypeError");
      expect(undefinedErr?.message).toMatch(/cannot be bound to SQLite parameter/);
      expect(nullErr?.constructor?.name).toBe("Error");
      expect(nullErr?.message).toMatch(/NOT NULL constraint failed: model_attempts.step_id/);
      const rows = store.db.prepare("SELECT step_id FROM model_attempts").all() as any[];
      expect(rows).toEqual([{ step_id: "" }]);
      expect(store.getRun("t-223").progress.model_calls).toBe(1);
    } finally {
      store.close();
    }
  });

});
