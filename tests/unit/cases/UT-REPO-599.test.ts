/**
 * Case ID: UT-REPO-599  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `恰好通过` 类（store.ts:755）
 * 维度坐标：`finish` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-599.md（脚本的唯一依据）
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

describe("UT-REPO-599 · finish · 数值/长度上限参数 × 恰好通过", () => {

  it("accepts the exact lease epoch and completes the run", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `恰好通过` 类构造参数 epoch——与 execution_slot.lease_epoch 完全相等的边界值；其余参数取合法等价类
      accept(store, task("t1"));
      const grant = store.tryClaimSlot("owner-1", "boot-1") as { task_id: string; lease_epoch: number };
      expect(grant.lease_epoch).toBe(1);

      // 步骤 2：调用 finish(…)
      store.finish(result("t1"), grant.lease_epoch);

      // 步骤 3：断言：被接受时返回值/状态与设计声明一致，逐值对账
      const run = store.db.prepare("SELECT state, finished_at FROM runs WHERE task_id='t1'").get() as any;
      expect(run.state).toBe("Completed");
      expect(run.finished_at).toBe("2026-11-09T00:00:00.000Z");
      // 槽在完成后被释放
      expect(store.readSlot().task_id).toBeNull();
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
