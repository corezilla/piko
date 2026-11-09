/**
 * Case ID: UT-REPO-270  ·  STATUS: real
 *
 * 责任：参数 `attempt: number` 的 `恰好通过` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-270.md（脚本的唯一依据）
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

describe("UT-REPO-270 · terminalModel · 数值/长度上限参数 × 恰好通过", () => {

  it("terminals the exact attempt number that was reserved", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `恰好通过` 类构造参数 attempt——与预留时完全相等的边界值 1；其余参数取合法等价类
      accept(store, task("t1"));
      store.reserveModel("t1", "op", "step", 1);

      // 步骤 2：调用 terminalModel(…)
      store.terminalModel("t1", "op", "step", 1);

      // 步骤 3：断言：被接受时返回值/状态与设计声明一致，逐值对账
      const row = store.db.prepare("SELECT state, record_version FROM model_attempts WHERE task_id='t1' AND attempt=1").get() as any;
      expect(row.state).toBe("Terminal");
      expect(row.record_version).toBe(2);
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
