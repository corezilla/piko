/**
 * Case ID: UT-REPO-283  ·  STATUS: real
 *
 * 责任：参数 `op: string` 的 `超长` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-283.md（脚本的唯一依据）
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

describe("UT-REPO-283 · reserveTool · 字符串/路径/枚举输入 × 超长", () => {

  it("accepts an over-long operation id without a length cap", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 op——长度 2×4096＝8192；其余参数取合法等价类
      accept(store, task("t-283"));
      const longOp = "o".repeat(8192);

      // 步骤 2：调用 reserveTool(…)
      const outcome = store.reserveTool("t-283", longOp, "id", "name", "effect", "never");

      // 步骤 3：断言——实现的真实语义：reserveTool 对 op 无长度上限，超长串原样落库
      expect(outcome).toBe("Admitted");
      const row = store.db.prepare("SELECT operation_id,tool_call_id,state FROM tool_calls").get() as any;
      expect(row.operation_id).toBe(longOp);
      expect(row.operation_id.length).toBe(8192);
      expect(row.state).toBe("Reserved");
    } finally {
      store.close();
    }
  });

});
