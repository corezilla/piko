/**
 * Case ID: UT-REPO-191  ·  STATUS: real
 *
 * 责任：状态写 L398 → `db`（store.ts）
 * 维度坐标：`recoverOrphaned` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-191.md（脚本的唯一依据）
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

describe("UT-REPO-191 · recoverOrphaned · 持久化/序列化 × round-trip", () => {

  it("carries the new lease epoch into the run session row", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 slot 被一个非终态 run 占用、且已有 run_sessions 行的前置状态
      store.createOrGet(task("ro-191"), "slinky", 10);
      store.tryClaimSlot("owner", "boot");
      const before = store.db.prepare("SELECT lease_epoch FROM run_sessions WHERE task_id=?").get("ro-191") as any;

      // 步骤 2：调用 recoverOrphaned("owner2", "boot2")
      const grant = store.recoverOrphaned("owner2", "boot2");

      // 步骤 3：断言逐值对账——run_sessions 的 lease_epoch 与 slot 同步推进
      expect(before.lease_epoch).toBe(1);
      expect(grant).toEqual({ task_id: "ro-191", lease_epoch: 2 });
      const after = store.db.prepare("SELECT lease_epoch FROM run_sessions WHERE task_id=?").get("ro-191") as any;
      expect(after.lease_epoch).toBe(2);
    } finally {
      store.close();
    }
  });

});
