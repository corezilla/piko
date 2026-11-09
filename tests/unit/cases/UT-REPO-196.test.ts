/**
 * Case ID: UT-REPO-196  ·  STATUS: real
 *
 * 责任：返回站点 L404 值 `this.db.prepare("SELECT task_id,owner_i…` 逐值断言（store.ts）
 * 维度坐标：`readSlot` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-196.md（脚本的唯一依据）
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

describe("UT-REPO-196 · readSlot · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the execution slot row verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造空闲与被占用两种执行位状态
      const free = store.readSlot();
      store.createOrGet(task("ro-196"), "slinky", 10);
      store.tryClaimSlot("owner", "boot");

      // 步骤 2：调用 readSlot()
      const held = store.readSlot();

      // 步骤 3：断言逐值对账——空闲时 task_id/owner_id/boot_id/heartbeat_at 全为 null、epoch=0；
      // 被占用时字段与写入值一致
      expect(free).toEqual({
        task_id: null,
        owner_id: null,
        boot_id: null,
        lease_epoch: 0,
        heartbeat_at: null,
      });
      expect(held.task_id).toBe("ro-196");
      expect(held.owner_id).toBe("owner");
      expect(held.boot_id).toBe("boot");
      expect(held.lease_epoch).toBe(1);
      expect(typeof held.heartbeat_at).toBe("string");
    } finally {
      store.close();
    }
  });

});
