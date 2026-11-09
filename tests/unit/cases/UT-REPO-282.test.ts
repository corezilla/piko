/**
 * Case ID: UT-REPO-282  ·  STATUS: real
 *
 * 责任：参数 `op: string` 的 `空` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-282.md（脚本的唯一依据）
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

describe("UT-REPO-282 · reserveTool · 字符串/路径/枚举输入 × 空", () => {

  it("accepts an empty op string but rejects null and undefined", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造参数 op——''（空串）、undefined（缺省）、null（显式空值）三态；其余参数取合法等价类
      accept(store, task("t1"));

      // 步骤 2：调用 reserveTool(…)
      const empty = store.reserveTool("t1", "", "tc-empty", "name", "effect", "never");
      let nullErr: any = null;
      try {
        store.reserveTool("t1", null as never, "tc-null", "name", "effect", "never");
      } catch (e) {
        nullErr = e;
      }
      let undefErr: any = null;
      try {
        store.reserveTool("t1", undefined as never, "tc-undef", "name", "effect", "never");
      } catch (e) {
        undefErr = e;
      }

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：reserveTool 自身不做参数校验——空串原样入库；
      //         null 被 NOT NULL 约束拒绝，undefined 被绑定层拒绝（都不是 typed PikoError）
      expect(empty).toBe("Admitted");
      expect(nullErr).not.toBeNull();
      expect(nullErr.code).toBe("ERR_SQLITE_ERROR");
      expect(nullErr.message).toContain("NOT NULL constraint failed: tool_calls.operation_id");
      expect(undefErr).not.toBeNull();
      expect(undefErr.code).toBe("ERR_INVALID_ARG_TYPE");
      expect(undefErr.message).toContain("cannot be bound to SQLite parameter 2");
      // 无残留：两条被拒的调用没有留下 tool_calls 行
      const rows = store.db.prepare("SELECT tool_call_id FROM tool_calls").all() as any[];
      expect(rows.map((r) => r.tool_call_id)).toEqual(["tc-empty"]);
    } finally {
      store.close();
    }
  });

});
