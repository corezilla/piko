/**
 * Case ID: UT-REPO-602  ·  STATUS: real
 *
 * 责任：分支 L758 `slot.task_id !== result.task_id || slot.lease…`（||；store.ts）
 * 维度坐标：`finish` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-602.md（脚本的唯一依据）
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

describe("UT-REPO-602 · finish · 并发/可重入 × 并发对偶/交错", () => {

  it("rejects a mismatched lease and accepts the exact one", async () => {
    const store = newStore();
    try {
      accept(store, task("t-602a"));
      accept(store, task("t-602b"));
      const grant = store.tryClaimSlot("worker", "boot") as { task_id: string; lease_epoch: number };

      // 步骤 1：构造使 store.ts:758 的分支（||）取真的输入——① `slot.task_id` ≠ `result.task_id`
      let err: any = null;
      try {
        store.finish(result("t-602b"), grant.lease_epoch);
      } catch (e) {
        err = e;
      }
      // 步骤 2：调用 finish(…) 并断言该侧可观测结果
      expect(err?.code).toBe("LeaseLost");
      expect(err?.status).toBe(409);
      expect(store.getRun("t-602a").state).toBe("Running");
      expect(store.getRun("t-602b").state).toBe("Queued");

      // 步骤 3：构造使该分支取假的输入——task_id 与 epoch 都对上
      // 步骤 4：再次调用 finish(…) 并断言取假侧结果（两侧都被观测到）
      store.finish(result("t-602a"), grant.lease_epoch);
      expect(store.getRun("t-602a").state).toBe("Completed");
      expect(store.readSlot().task_id).toBeNull();
    } finally {
      store.close();
    }
  });

});
