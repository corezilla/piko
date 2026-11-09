/**
 * Case ID: UT-REPO-313  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:483）
 * 维度坐标：`terminalTool` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-313.md（脚本的唯一依据）
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

describe("UT-REPO-313 · terminalTool · 字符串/路径/枚举输入 × 注入字符", () => {

  it("treats an injected task id as plain text and refuses to terminate", async () => {
    const store = newStore();
    try {
      accept(store, task("t-313"));
      store.reserveTool("t-313", "op-313", "id-313", "tool", "effect", "never");

      // 步骤 1：按 `注入字符` 类构造参数 taskId——穿越串 + SQL 元字符 + 控制字符
      // 步骤 2：调用 terminalTool(…)
      store.terminalTool("t-313'; DROP TABLE tool_calls;--", "op-313", "id-313");

      // 步骤 3：断言——实现的真实语义：注入串只是普通文本，UPDATE 命中 0 行、不报错；
      //         原来的 tool call 仍是 Reserved，表结构完好
      const rows = store.db.prepare("SELECT task_id,tool_call_id,state FROM tool_calls").all() as any[];
      expect(rows).toEqual([{ task_id: "t-313", tool_call_id: "id-313", state: "Reserved" }]);
      expect(store.db.prepare("SELECT count(*) n FROM tool_calls").get()).toEqual({ n: 1 });
    } finally {
      store.close();
    }
  });

});
