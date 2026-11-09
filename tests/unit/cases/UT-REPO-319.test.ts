/**
 * Case ID: UT-REPO-319  ·  STATUS: real
 *
 * 责任：参数 `id: string` 的 `注入字符` 类（store.ts:483）
 * 维度坐标：`terminalTool` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-319.md（脚本的唯一依据）
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

describe("UT-REPO-319 · terminalTool · 字符串/路径/枚举输入 × 注入字符", () => {

  it("treats an injection-shaped tool call id as a bound parameter", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 id——SQL 元字符 + 路径穿越串 + 控制字符
      accept(store, task("t-319"));
      store.reserveTool("t-319", "op", "id", "name", "effect", "never");
      const nasty = "'; DROP TABLE tool_calls;--\u0001../../etc";

      // 步骤 2：调用 terminalTool(…)
      store.terminalTool("t-319", "op", nasty);

      // 步骤 3：断言——参数化绑定：注入串命中不到任何行，既有记录仍是 Reserved，tool_calls 表完好
      const rows = store.db.prepare("SELECT tool_call_id,state FROM tool_calls").all() as any[];
      expect(rows.length).toBe(1);
      expect(rows[0].tool_call_id).toBe("id");
      expect(rows[0].state).toBe("Reserved");
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
