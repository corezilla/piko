/**
 * Case ID: UT-REPO-198  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:406）
 * 维度坐标：`renewSlot` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-198.md（脚本的唯一依据）
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

describe("UT-REPO-198 · renewSlot · 字符串/路径/枚举输入 × 超长", () => {
  it("stores nothing for an over-long task id and simply refuses to renew", async () => {
    const store = newStore();
    try {
      accept(store, task("t-198"));
      const grant = store.tryClaimSlot("worker", "boot") as { task_id: string; lease_epoch: number };
      store.db.prepare("UPDATE execution_slot SET heartbeat_at='2000-01-01T00:00:00.000Z'").run();
      const longId = "L".repeat(2 * 4096);

      // 步骤 1：按 `超长` 类构造参数 taskId——长度 2×上限（源码无比较常量，取缺省上限 4096 → 8192）；
      //         其余参数取合法等价类
      // 步骤 2：调用 renewSlot(…)
      const renewed = store.renewSlot(longId, grant.lease_epoch);

      // 步骤 3：断言——实现无任何长度校验：超长 id 只是不匹配 CAS 键，返回 false、
      //         心跳不刷新，且没有任何地方持久化了这段超长文本
      expect(renewed).toBe(false);
      expect(store.readSlot().heartbeat_at).toBe("2000-01-01T00:00:00.000Z");
      expect(store.readSlot().task_id).toBe("t-198");
      expect(store.readSlot().owner_id).toBe("worker");
      const persisted = store.db.prepare("SELECT count(*) n FROM tasks WHERE task_id=?").get(longId) as any;
      expect(persisted.n).toBe(0);
      expect((store.db.prepare("SELECT length(task_id) l FROM tasks").get() as any).l).toBe(5);
    } finally {
      store.close();
    }
  });

});
