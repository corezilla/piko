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

describe("UT-REPO-156 · tryClaimSlot · 并发/可重入 × 并发对偶/交错", () => {
  it("returns slot_busy when the slot is taken, and skips the guard when it is free", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:307 的分支（if：`if (slot.task_id)`）取真的输入——先占住槽位
      accept(store, task("t1"));
      accept(store, task("t2"));
      store.tryClaimSlot("owner-1", "boot-1");

      // 步骤 2：调用 tryClaimSlot 并断言该侧可观测结果
      const busy = store.tryClaimSlot("owner-2", "boot-2");
      const slotWhileBusy = store.readSlot();

      // 步骤 3：构造使该分支取假的输入（释放槽位后 slot.task_id 为 NULL），断言块内副作用不发生
      store.releaseSlot("t1", 1);
      const free = store.tryClaimSlot("owner-3", "boot-3");
      const slotAfterFree = store.readSlot();

      // 步骤 3：断言——取真侧直接返回 "slot_busy"，槽位与 owner 保持不变；
      // 取假侧越过守卫，认领到还在 Queued 的那条（t1 已 Running）
      expect(busy).toBe("slot_busy");
      expect(slotWhileBusy.task_id).toBe("t1");
      expect(slotWhileBusy.owner_id).toBe("owner-1");
      expect(free).toEqual({ task_id: "t2", lease_epoch: 2 });
      expect(slotAfterFree.task_id).toBe("t2");
      expect(slotAfterFree.owner_id).toBe("owner-3");
    } finally {
      store.close();
    }
  });

});
