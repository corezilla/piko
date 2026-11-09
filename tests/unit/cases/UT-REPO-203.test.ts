/**
 * Case ID: UT-REPO-203  ·  STATUS: real
 *
 * 责任：状态写 L407 → `db`（store.ts）
 * 维度坐标：`renewSlot` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-203.md（脚本的唯一依据）
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

describe("UT-REPO-203 · renewSlot · 持久化/序列化 × round-trip", () => {

  it("refreshes only the heartbeat of the slot row it CAS-matches", async () => {
    const store = newStore();
    try {
      accept(store, task("t-203"));
      const grant = store.tryClaimSlot("worker", "boot") as { task_id: string; lease_epoch: number };
      store.db.prepare("UPDATE execution_slot SET heartbeat_at='2000-01-01T00:00:00.000Z'").run();

      // 步骤 1：构造使 store.ts:407 对 `db` 的写被执行的前置状态
      expect(store.readSlot().heartbeat_at).toBe("2000-01-01T00:00:00.000Z");

      // 步骤 2：调用 renewSlot(…)
      const renewed = store.renewSlot("t-203", grant.lease_epoch);

      // 步骤 3：读回权威事实源逐值对账写入语义——heartbeat 被刷新，其余列原样保留
      const slot = store.readSlot();
      expect(renewed).toBe(true);
      expect(slot.heartbeat_at).not.toBe("2000-01-01T00:00:00.000Z");
      expect(new Date(slot.heartbeat_at as string).toISOString()).toBe(slot.heartbeat_at);
      expect(slot.task_id).toBe("t-203");
      expect(slot.owner_id).toBe("worker");
      expect(slot.boot_id).toBe("boot");
      expect(slot.lease_epoch).toBe(grant.lease_epoch);
    } finally {
      store.close();
    }
  });

});
