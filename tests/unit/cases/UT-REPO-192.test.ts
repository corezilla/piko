/**
 * Case ID: UT-REPO-192  ·  STATUS: real
 *
 * 责任：返回站点 L386 值 `this.tx(() => { const slot = this.db.pr…` 逐值断言（store.ts）
 * 维度坐标：`recoverOrphaned` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-192.md（脚本的唯一依据）
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

describe("UT-REPO-192 · recoverOrphaned · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the result produced inside the recovery transaction", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 slot 被一个非终态 run 占用的前置状态
      store.createOrGet(task("ro-192"), "slinky", 10);
      store.tryClaimSlot("owner", "boot");

      // 步骤 2：调用 recoverOrphaned("owner2", "boot2")
      const grant = store.recoverOrphaned("owner2", "boot2");

      // 步骤 3：断言逐值对账——tx 包装返回的就是 SlotGrant 对象本身
      expect(grant).toEqual({ task_id: "ro-192", lease_epoch: 2 });
      expect(Object.keys(grant as object).sort()).toEqual(["lease_epoch", "task_id"]);
    } finally {
      store.close();
    }
  });

});
