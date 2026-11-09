/**
 * Case ID: UT-REPO-208  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `恰好通过` 类（store.ts:410）
 * 维度坐标：`releaseSlot` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-208.md（脚本的唯一依据）
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

describe("UT-REPO-208 · releaseSlot · 数值/长度上限参数 × 恰好通过", () => {
  it("returns true for the exactly-matching epoch", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `恰好通过` 类构造 epoch——取槽位当前的 lease_epoch；
      // 其余参数取合法等价类
      accept(store, task("t1"));
      const grant = store.tryClaimSlot("owner-1", "boot-1") as any;
      // 步骤 2：调用 releaseSlot
            const released = store.releaseSlot("t1", grant.lease_epoch);
            const slot = store.readSlot();
      // 步骤 3：断言——恰好匹配 → true，槽位被清空
            expect(released).toBe(true);
            expect(slot.task_id).toBeNull();
            expect(slot.owner_id).toBeNull();
            expect(slot.boot_id).toBeNull();
            expect(slot.heartbeat_at).toBeNull();
            // lease_epoch 保留（不归零）
            expect(slot.lease_epoch).toBe(grant.lease_epoch);
    } finally {
      store.close();
    }
  });

});
