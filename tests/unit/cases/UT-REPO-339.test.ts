/**
 * Case ID: UT-REPO-339  ·  STATUS: real
 *
 * 责任：参数 `op: string` 的 `空` 类（store.ts:489）
 * 维度坐标：`markTurn` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-339.md（脚本的唯一依据）
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

describe("UT-REPO-339 · markTurn · 字符串/路径/枚举输入 × 空", () => {

  it("writes an empty pi operation id verbatim when it is given explicitly", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 op——''（空串）、null（显式空值）；其余参数取合法等价类
      acceptDiscussion(store, "t-339", "!room:339");

      // 步骤 2：调用 markTurn(…)
      store.markTurn("t-339", "$e1", "QueuedInPi", "entry-1", "");

      // 步骤 3：断言——实现的真实语义：op ?? null 只挡 undefined/null；显式空串会原样写入
      const row = store.db.prepare("SELECT pi_entry_id,pi_operation_id FROM discussion_turns").get() as any;
      expect(row.pi_operation_id).toBe("");
      expect(row.pi_operation_id).not.toBeNull();
      expect(row.pi_entry_id).toBe("entry-1");
    } finally {
      store.close();
    }
  });

});
