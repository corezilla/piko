/**
 * Case ID: UT-REPO-202  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `−1 通过` 类（store.ts:406）
 * 维度坐标：`renewSlot` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-202.md（脚本的唯一依据）
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

describe("UT-REPO-202 · renewSlot · 数值/长度上限参数 × −1 通过", () => {
  it("refuses to renew with epoch minus one", async () => {
    const store = newStore();
    try {
      accept(store, task("t-202"));
      const grant = store.tryClaimSlot("worker", "boot") as { task_id: string; lease_epoch: number };
      store.db.prepare("UPDATE execution_slot SET heartbeat_at='2000-01-01T00:00:00.000Z'").run();

      // 步骤 1：按 `−1 通过` 类构造参数 epoch——边界值 −1（当前租约 epoch 为 1）；
      //         其余参数取合法等价类
      // 步骤 2：调用 renewSlot(…)
      const renewed = store.renewSlot("t-202", -1);

      // 步骤 3：断言——实现的真实语义与用例文档的类名不同：renewSlot 用 lease_epoch 的
      //         精确相等匹配，−1 并不「通过」，而是匹配 0 行 → 返回 false、心跳不刷新
      expect(renewed).toBe(false);
      expect(store.readSlot().heartbeat_at).toBe("2000-01-01T00:00:00.000Z");
      expect(store.readSlot().lease_epoch).toBe(grant.lease_epoch);
      expect(store.readSlot().task_id).toBe("t-202");
      // 对照：恰好等于当前 epoch 时才通过
      expect(store.renewSlot("t-202", grant.lease_epoch)).toBe(true);
    } finally {
      store.close();
    }
  });

});
