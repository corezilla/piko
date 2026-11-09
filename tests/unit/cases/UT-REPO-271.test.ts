/**
 * Case ID: UT-REPO-271  ·  STATUS: real
 *
 * 责任：参数 `attempt: number` 的 `+1 拒绝` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-271.md（脚本的唯一依据）
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

describe("UT-REPO-271 · terminalModel · 数值/长度上限参数 × +1 拒绝", () => {

  it("refuses to terminate an attempt one past the reserved one", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `+1 拒绝` 类构造 attempt——已预留的是 attempt=1，边界值取 1+1=2
      accept(store, task("t-271"));
      store.reserveModel("t-271", "op", "step", 1);

      // 步骤 2：调用 terminalModel(…)
      store.terminalModel("t-271", "op", "step", 2);

      // 步骤 3：断言——实现的真实语义：terminalModel 只按 (task,op,step,attempt) 精确匹配，
      // attempt=2 无对应行 → 影响 0 行，既有 attempt=1 仍是 Started
      const rows = store.db.prepare("SELECT attempt,state FROM model_attempts").all() as any[];
      expect(rows.length).toBe(1);
      expect(rows[0].attempt).toBe(1);
      expect(rows[0].state).toBe("Started");

      // 对照：正确的 attempt 才会落终态
      store.terminalModel("t-271", "op", "step", 1);
      expect((store.db.prepare("SELECT state FROM model_attempts").get() as any).state).toBe("Terminal");
    } finally {
      store.close();
    }
  });

});
