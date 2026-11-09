/**
 * Case ID: UT-REPO-281  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-281.md（脚本的唯一依据）
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

describe("UT-REPO-281 · reserveTool · 字符串/路径/枚举输入 × 注入字符", () => {

  it("treats an injected task id as plain text and still admits the tool call", async () => {
    const store = newStore();
    try {
      const injected = "t-281'; DROP TABLE tool_calls;--";
      accept(store, task(injected));

      // 步骤 1：按 `注入字符` 类构造参数 taskId——穿越串 + SQL 元字符 + 控制字符
      // 步骤 2：调用 reserveTool(…)
      const admitted = store.reserveTool(injected, "op-281", "id-281", "tool", "effect", "never", "contract");

      // 步骤 3：断言——实现没有校验语句：注入串被绑定层当作普通文本原样落库，
      //         返回值仍是 Admitted，且 tool_calls 表没有被破坏
      expect(admitted).toBe("Admitted");
      const row = store.db.prepare("SELECT task_id,tool_call_id,state FROM tool_calls").get() as any;
      expect(row.task_id).toBe(injected);
      expect(row.tool_call_id).toBe("id-281");
      expect(row.state).toBe("Reserved");
      expect(store.db.prepare("SELECT count(*) n FROM tool_calls").get()).toEqual({ n: 1 });
    } finally {
      store.close();
    }
  });

});
