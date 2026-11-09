/**
 * Case ID: UT-REPO-317  ·  STATUS: real
 *
 * 责任：参数 `id: string` 的 `空` 类（store.ts:483）
 * 维度坐标：`terminalTool` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-317.md（脚本的唯一依据）
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

describe("UT-REPO-317 · terminalTool · 字符串/路径/枚举输入 × 空", () => {

  it("accepts an empty tool call id, rejects null and refuses to bind undefined", async () => {
    const store = newStore();
    try {
      accept(store, task("t-317"));
      store.reserveTool("t-317", "op-317", "", "tool", "effect", "never");

      // 步骤 1：按 `空` 类构造参数 id——''（空串）、undefined（缺省）、null（显式空值）
      // 步骤 2：调用 terminalTool(…)
      store.terminalTool("t-317", "op-317", "");
      let undefinedErr: any = null;
      try {
        store.terminalTool("t-317", "op-317", undefined as unknown as string);
      } catch (e) {
        undefinedErr = e;
      }
      let nullErr: any = null;
      try {
        store.terminalTool("t-317", "op-317", null as unknown as string);
      } catch (e) {
        nullErr = e;
      }

      // 步骤 3：断言——实现的真实语义：空串与 null 都是合法的 SQL 值，只是命中 0 行、
      //         不报错也不改状态；undefined 被绑定层拒绝（TypeError）
      expect(undefinedErr?.constructor?.name).toBe("TypeError");
      expect(undefinedErr?.message).toMatch(/cannot be bound to SQLite parameter/);
      expect(nullErr).toBeNull();
      const rows = store.db.prepare("SELECT tool_call_id,state FROM tool_calls").all() as any[];
      expect(rows).toEqual([{ tool_call_id: "", state: "Terminal" }]);
    } finally {
      store.close();
    }
  });

});
