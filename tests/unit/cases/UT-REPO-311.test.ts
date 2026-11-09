/**
 * Case ID: UT-REPO-311  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:483）
 * 维度坐标：`terminalTool` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-311.md（脚本的唯一依据）
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

describe("UT-REPO-311 · terminalTool · 字符串/路径/枚举输入 × 空", () => {

  it("updates nothing for an empty taskId", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 taskId——''（空串）、null（显式空值）；其余参数取合法等价类
      accept(store, task("t-311"));
      store.reserveTool("t-311", "op", "id", "name", "effect", "never");

      // 步骤 2：调用 terminalTool(…)
      store.terminalTool("", "op", "id");
      store.terminalTool(null as any, "op", "id");

      // 步骤 3：断言——实现的真实语义：空串/null 都匹配不到任何行，
      // UPDATE 影响 0 行，既有 tool_calls 记录仍是 Reserved（无状态写残留）
      const rows = store.db.prepare("SELECT task_id,state FROM tool_calls").all() as any[];
      expect(rows.length).toBe(1);
      expect(rows[0].task_id).toBe("t-311");
      expect(rows[0].state).toBe("Reserved");
    } finally {
      store.close();
    }
  });

});
