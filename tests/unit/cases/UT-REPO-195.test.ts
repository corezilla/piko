/**
 * Case ID: UT-REPO-195  ·  STATUS: real
 *
 * 责任：返回站点 L399 值 `{ task_id: slot.task_id, lease_epoch: e…` 逐值断言（store.ts）
 * 维度坐标：`recoverOrphaned` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-195.md（脚本的唯一依据）
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

describe("UT-REPO-195 · recoverOrphaned · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the grant carrying the reclaimed task id and new lease epoch", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 slot 被一个非终态 run 占用的前置状态
      store.createOrGet(task("ro-195"), "slinky", 10);
      store.tryClaimSlot("owner", "boot");

      // 步骤 2：调用 recoverOrphaned("owner2", "boot2")
      const grant = store.recoverOrphaned("owner2", "boot2");

      // 步骤 3：断言逐值对账——task_id 取自 slot，lease_epoch 是 slot.lease_epoch+1
      expect(grant).toEqual({ task_id: "ro-195", lease_epoch: 2 });
      expect((grant as any).task_id).toBe(store.readSlot().task_id);
      expect((grant as any).lease_epoch).toBe(store.readSlot().lease_epoch);
    } finally {
      store.close();
    }
  });

});
