/**
 * Case ID: UT-REPO-285  ·  STATUS: real
 *
 * 责任：参数 `id: string` 的 `空` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-285.md（脚本的唯一依据）
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

describe("UT-REPO-285 · reserveTool · 字符串/路径/枚举输入 × 空", () => {

  it("accepts an empty tool call id, rejects null and refuses to bind undefined", async () => {
    const store = newStore();
    try {
      accept(store, task("t-285"));

      // 步骤 1：按 `空` 类构造参数 id——''（空串）、undefined（缺省）、null（显式空值）
      // 步骤 2：调用 reserveTool(…)
      expect(store.reserveTool("t-285", "op-285", "", "tool", "effect", "never")).toBe("Admitted");
      let undefinedErr: any = null;
      try {
        store.reserveTool("t-285", "op-285", undefined as unknown as string, "tool", "effect", "never");
      } catch (e) {
        undefinedErr = e;
      }
      let nullErr: any = null;
      try {
        store.reserveTool("t-285", "op-285", null as unknown as string, "tool", "effect", "never");
      } catch (e) {
        nullErr = e;
      }

      // 步骤 3：断言——实现的真实语义：空串是合法的 tool_call_id 并原样落库；
      //         undefined 被绑定层拒绝，null 撞 NOT NULL 约束，两次失败都回滚
      expect(undefinedErr?.constructor?.name).toBe("TypeError");
      expect(undefinedErr?.message).toMatch(/cannot be bound to SQLite parameter/);
      expect(nullErr?.constructor?.name).toBe("Error");
      expect(nullErr?.message).toMatch(/NOT NULL constraint failed: tool_calls.tool_call_id/);
      const rows = store.db.prepare("SELECT tool_call_id FROM tool_calls").all() as any[];
      expect(rows).toEqual([{ tool_call_id: "" }]);
      expect(store.getRun("t-285").progress.tool_calls).toBe(1);
    } finally {
      store.close();
    }
  });

});
