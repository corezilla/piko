/**
 * Case ID: UT-REPO-200  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `恰好通过` 类（store.ts:406）
 * 维度坐标：`renewSlot` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-200.md（脚本的唯一依据）
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

describe("UT-REPO-200 · renewSlot · 数值/长度上限参数 × 恰好通过", () => {

  it("accepts the exact lease epoch and renews the heartbeat", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `恰好通过` 类构造参数 epoch——与 execution_slot.lease_epoch 完全相等的边界值；其余参数取合法等价类
      accept(store, task("t1"));
      const before = store.readSlot().heartbeat_at;
      const grant = store.tryClaimSlot("owner-1", "boot-1") as { task_id: string; lease_epoch: number };
      expect(grant.lease_epoch).toBe(1);

      // 步骤 2：调用 renewSlot(…)
      const renewed = store.renewSlot(grant.task_id, grant.lease_epoch);

      // 步骤 3：断言：被接受时返回值/状态与设计声明一致，逐值对账
      expect(renewed).toBe(true);
      const after = store.readSlot();
      expect(after.task_id).toBe("t1");
      expect(after.lease_epoch).toBe(grant.lease_epoch);
      // 心跳被写上：续租前为空，续租后是一个 ISO 时间戳
      expect(before).toBeNull();
      expect(typeof after.heartbeat_at).toBe("string");
      expect(Number.isNaN(Date.parse(after.heartbeat_at as string))).toBe(false);
    } finally {
      store.close();
    }
  });

});
