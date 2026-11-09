/**
 * Case ID: UT-REPO-211  ·  STATUS: real
 *
 * 责任：状态写 L411 → `db`（store.ts）
 * 维度坐标：`releaseSlot` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-211.md（脚本的唯一依据）
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

describe("UT-REPO-211 · releaseSlot · 持久化/序列化 × round-trip", () => {
  it("clears the slot row fields on a matching release", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:411 对 `db` 的写被执行的前置状态——槽位被占
      accept(store, task("t1"));
      store.tryClaimSlot("owner-1", "boot-1");
      const before = store.db.prepare("SELECT * FROM execution_slot WHERE slot_id=1").get() as any;
      // 步骤 2：调用 releaseSlot
            const released = store.releaseSlot("t1", 1);
            const after = store.db.prepare("SELECT * FROM execution_slot WHERE slot_id=1").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(released).toBe(true);
            expect(before.task_id).toBe("t1");
            expect(after.task_id).toBeNull();
            expect(after.owner_id).toBeNull();
            expect(after.boot_id).toBeNull();
            expect(after.heartbeat_at).toBeNull();
            expect(after.lease_epoch).toBe(1);
    } finally {
      store.close();
    }
  });

});
