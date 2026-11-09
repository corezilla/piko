/**
 * Case ID: UT-REPO-209  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `+1 拒绝` 类（store.ts:410）
 * 维度坐标：`releaseSlot` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-209.md（脚本的唯一依据）
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

describe("UT-REPO-209 · releaseSlot · 数值/长度上限参数 × +1 拒绝", () => {
  it("returns false for epoch+1 (lease moved on)", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `+1 拒绝` 类构造 epoch——当前 lease_epoch + 1；其余参数取合法等价类
      accept(store, task("t1"));
      const grant = store.tryClaimSlot("owner-1", "boot-1") as any;
      // 步骤 2：调用 releaseSlot
            const released = store.releaseSlot("t1", grant.lease_epoch + 1);
            const slot = store.readSlot();
      // 步骤 3：断言——epoch 不匹配 → UPDATE 匹配 0 行 → false，槽位保持被占用
            expect(released).toBe(false);
            expect(slot.task_id).toBe("t1");
            expect(slot.owner_id).toBe("owner-1");
            expect(slot.lease_epoch).toBe(grant.lease_epoch);
    } finally {
      store.close();
    }
  });

});
