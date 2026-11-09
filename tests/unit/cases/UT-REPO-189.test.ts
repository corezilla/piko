/**
 * Case ID: UT-REPO-189  ·  STATUS: real
 *
 * 责任：状态写 L391 → `db`（store.ts）
 * 维度坐标：`recoverOrphaned` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-189.md（脚本的唯一依据）
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

describe("UT-REPO-189 · recoverOrphaned · 持久化/序列化 × round-trip", () => {

  it("clears the slot columns when releasing an orphaned slot", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 slot 被占用且其 run 已终态的前置状态
      store.createOrGet(task("ro-189"), "slinky", 10);
      store.tryClaimSlot("owner", "boot");
      store.db.prepare("UPDATE runs SET state='Failed' WHERE task_id=?").run("ro-189");

      // 步骤 2：调用 recoverOrphaned("owner", "boot")
      store.recoverOrphaned("owner", "boot");

      // 步骤 3：断言逐值对账——释放写把 task_id/owner_id/boot_id/heartbeat_at 全部清空，
      // 但 lease_epoch 保持原值
      const slot = store.readSlot();
      expect(slot.task_id).toBeNull();
      expect(slot.owner_id).toBeNull();
      expect(slot.boot_id).toBeNull();
      expect(slot.heartbeat_at).toBeNull();
      expect(slot.lease_epoch).toBe(1);
    } finally {
      store.close();
    }
  });

});
