/**
 * Case ID: UT-REPO-261  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-261.md（脚本的唯一依据）
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

describe("UT-REPO-261 · terminalModel · 字符串/路径/枚举输入 × 空", () => {

  it("accepts an empty task id and refuses to bind undefined", async () => {
    const store = newStore();
    try {
      accept(store, task("t-261"));
      store.reserveModel("t-261", "op-261", "step-261", 1);

      // 步骤 1：按 `空` 类构造参数 taskId——''（空串）、undefined（缺省）、null（显式空值）
      // 步骤 2：调用 terminalModel(…)
      store.terminalModel("", "op-261", "step-261", 1);
      let undefinedErr: any = null;
      try {
        store.terminalModel(undefined as unknown as string, "op-261", "step-261", 1);
      } catch (e) {
        undefinedErr = e;
      }
      let nullErr: any = null;
      try {
        store.terminalModel(null as unknown as string, "op-261", "step-261", 1);
      } catch (e) {
        nullErr = e;
      }

      // 步骤 3：断言——实现的真实语义：空串与 null 都是合法的 SQL 值，只是不命中任何
      //         attempt 行，所以那次 UPDATE 影响 0 行、不报错；undefined 被绑定层拒绝
      expect(undefinedErr?.constructor?.name).toBe("TypeError");
      expect(undefinedErr?.message).toMatch(/cannot be bound to SQLite parameter/);
      expect(nullErr).toBeNull();
      // 空串/null 两次调用都没命中行，原行仍是 Started
      const rows = store.db.prepare("SELECT state FROM model_attempts").all() as any[];
      expect(rows).toEqual([{ state: "Started" }]);
    } finally {
      store.close();
    }
  });

});
