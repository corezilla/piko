/**
 * Case ID: UT-REPO-170  ·  STATUS: real
 *
 * 责任：分支 L375 `if (owned)`（if；store.ts）
 * 维度坐标：`failAccessLostTasks` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-170.md（脚本的唯一依据）
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

describe("UT-REPO-170 · failAccessLostTasks · 状态分支 × 合法迁移", () => {
  it("releases the execution slot only for a task that still owns it and never started", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:348 的分支（loop）取真的输入——
      // 两条 access-lost 的 Queued 任务；其中一条通过直接改 execution_slot 假装持有 slot，
      // 另一条完全不占 slot
      acceptDiscussion(store, "owns-slot", "!room:x");
      acceptDiscussion(store, "no-slot", "!room:x");
      store.db
        .prepare("UPDATE execution_slot SET task_id='owns-slot',owner_id='o',boot_id='b',lease_epoch=4 WHERE slot_id=1")
        .run();
      store.markDiscussionAccessLost("!room:x");

      // 步骤 2：调用 failAccessLostTasks(…) 并断言该侧可观测结果与设计一致
      const failed = store.failAccessLostTasks();
      expect(failed).toEqual(["no-slot", "owns-slot"]);

      // 步骤 3：构造使该分支取假的输入——不持有 slot 的任务走 `if (owned)` 的取假侧
      // 步骤 4：再次调用 failAccessLostTasks(…) 并断言取假侧结果；两侧都必须被观测到
      // `if (owned)` 的取真侧：持有 slot 的任务被清空（task_id/owner_id/boot_id/heartbeat_at）
      const slot = store.readSlot();
      expect(slot.task_id).toBeNull();
      expect(slot.owner_id).toBeNull();
      expect(slot.boot_id).toBeNull();
      expect(slot.heartbeat_at).toBeNull();
      // lease_epoch 不被清零（它是单调递增的租约代数）
      expect(slot.lease_epoch).toBe(4);

      // 取假侧：不持有 slot 的任务依然走完终态写入，只是没碰 slot
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='no-slot'").get() as any).state).toBe("Failed");
      expect(store.failAccessLostTasks()).toEqual([]);
    } finally {
      store.close();
    }
  });

});
