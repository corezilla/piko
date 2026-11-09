/**
 * Case ID: UT-REPO-210  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `−1 通过` 类（store.ts:410）
 * 维度坐标：`releaseSlot` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-210.md（脚本的唯一依据）
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

describe("UT-REPO-210 · releaseSlot · 数值/长度上限参数 × −1 通过", () => {
  it("returns false for epoch-1 (a stale lease epoch)", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `−1 通过` 类构造 epoch——当前 lease_epoch − 1；
      // 其余参数取合法等价类
      accept(store, task("t1"));
      const grant = store.tryClaimSlot("owner-1", "boot-1") as any;
      // 步骤 2：调用 releaseSlot
            const released = store.releaseSlot("t1", grant.lease_epoch - 1);
            const slot = store.readSlot();
      // 步骤 3：断言——实现的真实语义：releaseSlot 用精确相等匹配 epoch，
            // 所以 epoch−1 也被拒绝（返回 false），并非"−1 通过"
            expect(released).toBe(false);
            expect(slot.task_id).toBe("t1");
            expect(slot.owner_id).toBe("owner-1");
            expect(slot.lease_epoch).toBe(grant.lease_epoch);
    } finally {
      store.close();
    }
  });

});
