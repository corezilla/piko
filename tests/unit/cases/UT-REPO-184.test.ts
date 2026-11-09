/**
 * Case ID: UT-REPO-184  ·  STATUS: real
 *
 * 责任：分支 L388 `if (!slot.task_id)`（if；store.ts）
 * 维度坐标：`recoverOrphaned` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-184.md（脚本的唯一依据）
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

describe("UT-REPO-184 · recoverOrphaned · 并发/可重入 × 并发对偶/交错", () => {

  it("returns null when the execution slot is free", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 store.ts:388 的 if (!slot.task_id) 取真的输入——执行位空闲
      expect(store.readSlot().task_id).toBeNull();

      // 步骤 2：调用 recoverOrphaned("owner", "boot")
      const grant = store.recoverOrphaned("owner", "boot");

      // 步骤 3：断言逐值对账——空闲位直接返回 null，slot 不变
      expect(grant).toBeNull();
      expect(store.readSlot().task_id).toBeNull();
      expect(store.readSlot().lease_epoch).toBe(0);
    } finally {
      store.close();
    }
  });

});
