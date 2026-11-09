/**
 * Case ID: UT-REPO-267  ·  STATUS: real
 *
 * 责任：参数 `step: string` 的 `空` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-267.md（脚本的唯一依据）
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

describe("UT-REPO-267 · terminalModel · 字符串/路径/枚举输入 × 空", () => {

  it("updates nothing for an empty step id", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 step——''（空串）、null（显式空值）；其余参数取合法等价类
      accept(store, task("t-267"));
      store.reserveModel("t-267", "op", "step", 1);

      // 步骤 2：调用 terminalModel(…)
      store.terminalModel("t-267", "op", "", 1);
      store.terminalModel("t-267", "op", null as any, 1);

      // 步骤 3：断言——实现的真实语义：空串/null 都匹配不到任何 step_id 相同的行，
      // UPDATE 影响 0 行，既有记录仍是 Started（无状态写残留）
      const rows = store.db.prepare("SELECT step_id,state FROM model_attempts").all() as any[];
      expect(rows.length).toBe(1);
      expect(rows[0].step_id).toBe("step");
      expect(rows[0].state).toBe("Started");
    } finally {
      store.close();
    }
  });

});
