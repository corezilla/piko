/**
 * Case ID: UT-REPO-185  ·  STATUS: real
 *
 * 责任：分支 L388 `!slot.task_id`（!；store.ts）
 * 维度坐标：`recoverOrphaned` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-185.md（脚本的唯一依据）
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

describe("UT-REPO-185 · recoverOrphaned · 并发/可重入 × 并发对偶/交错", () => {

  it("negates slot.task_id and short-circuits to null", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 slot.task_id 为假（null）的输入，并先占用一次让 epoch 前进
      store.createOrGet(task("ro-185"), "slinky", 10);
      store.tryClaimSlot("owner", "boot");
      store.releaseSlot("ro-185", 1);

      // 步骤 2：调用 recoverOrphaned("owner", "boot")
      const grant = store.recoverOrphaned("owner", "boot");

      // 步骤 3：断言逐值对账——!slot.task_id 为真，直接返回 null，epoch 未推进
      expect(grant).toBeNull();
      expect(store.readSlot().task_id).toBeNull();
      expect(store.readSlot().lease_epoch).toBe(1);
    } finally {
      store.close();
    }
  });

});
