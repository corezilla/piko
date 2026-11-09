/**
 * Case ID: UT-REPO-190  ·  STATUS: real
 *
 * 责任：状态写 L395 → `db`（store.ts）
 * 维度坐标：`recoverOrphaned` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-190.md（脚本的唯一依据）
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

describe("UT-REPO-190 · recoverOrphaned · 持久化/序列化 × round-trip", () => {

  it("writes the new owner, boot and lease epoch when reclaiming the slot", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 slot 被一个非终态 run 占用的前置状态
      store.createOrGet(task("ro-190"), "slinky", 10);
      store.tryClaimSlot("owner", "boot");

      // 步骤 2：调用 recoverOrphaned("owner2", "boot2")
      const grant = store.recoverOrphaned("owner2", "boot2");

      // 步骤 3：断言逐值对账——执行位写进新的 owner/boot，epoch ＋1，heartbeat 被刷新
      expect(grant).toEqual({ task_id: "ro-190", lease_epoch: 2 });
      const slot = store.readSlot();
      expect(slot.owner_id).toBe("owner2");
      expect(slot.boot_id).toBe("boot2");
      expect(slot.lease_epoch).toBe(2);
      expect(typeof slot.heartbeat_at).toBe("string");
    } finally {
      store.close();
    }
  });

});
