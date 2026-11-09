/**
 * Case ID: UT-REPO-528  ·  STATUS: real
 *
 * 责任：分支 L638 `if (isTerminal(r.state))`（if；store.ts）
 * 维度坐标：`cancel` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-528.md（脚本的唯一依据）
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

describe("UT-REPO-528 · cancel · 状态分支 × 合法迁移", () => {

  it("reports AlreadyTerminal for a terminal run and CancelledBeforeStart for a queued one", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:638 的分支取真的输入——一条已处于终态的 run
      accept(store, task("t1"));
      expect(store.cancel("t1").outcome).toBe("CancelledBeforeStart");
      const terminal = store.cancel("t1");

      // 步骤 2：调用 cancel(…) 并断言该侧可观测结果（返回值/状态/副作用）与设计一致
      expect(terminal.outcome).toBe("AlreadyTerminal");
      expect(typeof terminal.requested_at).toBe("string");
      expect(terminal.requested_at.length).toBeGreaterThan(0);
      // 终态分支无副作用：状态与结果都不再变
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='t1'").get() as any).state).toBe("Cancelled");
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);

      // 步骤 3：构造使该分支取假的输入——非终态的 Queued run（无显式 else：取假即跳过该块，断言块内副作用不发生）
      accept(store, task("t2"));

      // 步骤 4：再次调用 cancel(…) 并断言取假侧结果；两侧都必须被观测到
      const queued = store.cancel("t2");
      expect(queued.outcome).toBe("CancelledBeforeStart");
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='t2'").get() as any).state).toBe("Cancelled");
    } finally {
      store.close();
    }
  });

});
