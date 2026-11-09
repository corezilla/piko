/**
 * Case ID: UT-REPO-265  ·  STATUS: real
 *
 * 责任：参数 `op: string` 的 `超长` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-265.md（脚本的唯一依据）
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

describe("UT-REPO-265 · terminalModel · 字符串/路径/枚举输入 × 超长", () => {

  it("stores an over-length operation id verbatim", async () => {
    const store = newStore();
    try {
      accept(store, task("t-265"));
      const longOp = "o".repeat(8192);
      store.reserveModel("t-265", longOp, "step-265", 1);

      // 步骤 1：按 `超长` 类构造参数 op——长度 2×4096 的字符串
      // 步骤 2：调用 terminalModel(…)
      store.terminalModel("t-265", longOp, "step-265", 1);

      // 步骤 3：断言——实现没有长度上限校验：8192 字符的 operation_id 原样落库并被命中，
      //         attempt 行推进到 Terminal
      const row = store.db.prepare("SELECT length(operation_id) len,state FROM model_attempts").get() as any;
      expect(row.len).toBe(8192);
      expect(row.state).toBe("Terminal");
    } finally {
      store.close();
    }
  });

});
