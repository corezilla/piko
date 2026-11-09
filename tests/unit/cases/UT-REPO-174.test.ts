/**
 * Case ID: UT-REPO-156  ·  STATUS: real
 *
 * 责任：分支 L307 `if (slot.task_id)`（if；store.ts）
 * 维度坐标：`tryClaimSlot` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-156.md（脚本的唯一依据）
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

describe("UT-REPO-174 · failAccessLostTasks · 持久化/序列化 × round-trip", () => {
  it("clears the slot ownership fields when the access-lost task owned the slot", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:376 对 `db` 的写被执行的前置状态——
      // 一条 access-lost 的 Queued 任务，且 execution_slot 的 task_id 指向它
      acceptDiscussion(store, "lost-1", "!room:x");
      store.markDiscussionAccessLost("!room:x");
      store.db
        .prepare(
          "UPDATE execution_slot SET task_id='lost-1',owner_id='owner-1',boot_id='boot-1',lease_epoch=2,heartbeat_at='2026-01-01T00:00:00.000Z' WHERE slot_id=1",
        )
        .run();
      expect(store.readSlot().task_id).toBe("lost-1");

      // 步骤 2：调用 failAccessLostTasks(…)
      expect(store.failAccessLostTasks()).toEqual(["lost-1"]);

      // 步骤 3：读回权威事实源（逐行对账）逐值对账写入语义
      const slot = store.readSlot();
      expect(slot.task_id).toBeNull();
      expect(slot.owner_id).toBeNull();
      expect(slot.boot_id).toBeNull();
      expect(slot.heartbeat_at).toBeNull();
      // lease_epoch 不在清理范围内——它只增不减
      expect(slot.lease_epoch).toBe(2);
    } finally {
      store.close();
    }
  });

});
