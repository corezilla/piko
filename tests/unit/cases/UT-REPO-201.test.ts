/**
 * Case ID: UT-REPO-201  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `+1 拒绝` 类（store.ts:406）
 * 维度坐标：`renewSlot` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-201.md（脚本的唯一依据）
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

describe("UT-REPO-201 · renewSlot · 数值/长度上限参数 × +1 拒绝", () => {

  it("refuses to renew the slot when the epoch is one past the current one", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `+1 拒绝` 类构造参数 epoch——当前租约 epoch 为 1，边界值取 1+1=2
      accept(store, task("t-201"));
      store.tryClaimSlot("owner", "boot");
      const heartbeatBefore = store.readSlot().heartbeat_at;

      // 步骤 2：调用 renewSlot(…)
      const renewed = store.renewSlot("t-201", 2);

      // 步骤 3：断言——实现的真实语义：renewSlot 无显式校验，只按 (task_id,lease_epoch) 匹配 UPDATE；
      // epoch 不符 → 匹配 0 行 → 返回 false，心跳不被刷新（无状态写残留）
      expect(renewed).toBe(false);
      expect(store.readSlot().heartbeat_at).toBe(heartbeatBefore);
      expect(store.readSlot().task_id).toBe("t-201");
      expect(store.readSlot().lease_epoch).toBe(1);

      // 正确 epoch 仍然可以续租（对照）
      expect(store.renewSlot("t-201", 1)).toBe(true);
    } finally {
      store.close();
    }
  });

});
