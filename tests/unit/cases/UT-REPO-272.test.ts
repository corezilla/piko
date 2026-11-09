/**
 * Case ID: UT-REPO-272  ·  STATUS: real
 *
 * 责任：参数 `attempt: number` 的 `−1 通过` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-272.md（脚本的唯一依据）
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

describe("UT-REPO-272 · terminalModel · 数值/长度上限参数 × −1 通过", () => {
  it("refuses to terminalize an attempt whose number is minus one", async () => {
    const store = newStore();
    try {
      accept(store, task("t-272"));
      store.reserveModel("t-272", "op", "step", 1);

      // 步骤 1：按 `−1 通过` 类构造参数 attempt——边界值 −1（已预留的尝试号是 1）；
      //         其余参数取合法等价类
      // 步骤 2：调用 terminalModel(…)
      const returned = store.terminalModel("t-272", "op", "step", -1);

      // 步骤 3：断言——实现的真实语义与用例文档的类名不同：terminalModel 用 attempt 的
      //         精确相等匹配，−1 并不「通过」，而是匹配 0 行 → 静默返回 undefined、状态未变
      expect(returned).toBeUndefined();
      const row = store.db.prepare("SELECT state, record_version FROM model_attempts").get() as any;
      expect(row.state).toBe("Started");
      expect(row.record_version).toBe(1);
      // 对照：恰好等于预留的尝试号时才会推进状态
      store.terminalModel("t-272", "op", "step", 1);
      expect((store.db.prepare("SELECT state FROM model_attempts").get() as any).state).toBe("Terminal");
    } finally {
      store.close();
    }
  });

});
