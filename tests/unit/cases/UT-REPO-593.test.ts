/**
 * Case ID: UT-REPO-593  ·  STATUS: real
 *
 * 责任：分支 L748 `slot.task_id !== result.task_id || slot.lease…`（||；store.ts）
 * 维度坐标：`publishResult` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-593.md（脚本的唯一依据）
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

describe("UT-REPO-593 · publishResult · 并发/可重入 × 并发对偶/交错", () => {
  it("throws LeaseLost on either side of the disjunction and succeeds only when both are false", async () => {
    const store = newStore();
    try {
      accept(store, task("t-593"));
      accept(store, task("t-593-other"));
      const grant = store.tryClaimSlot("owner-593", "boot-593") as { task_id: string; lease_epoch: number };

      // 步骤 1：构造使 store.ts:748 的分支（||：`slot.task_id !== result.task_id || slot.lease_epoch !== epoch`）
      //         取真的输入——左操作数为真（result 的 task_id 与槽不符）
      let wrongTask: any = null;
      try {
        store.publishResult(result("t-593-other"), grant.lease_epoch);
      } catch (e) {
        wrongTask = e;
      }
      //         右操作数为真（epoch 不符）
      let wrongEpoch: any = null;
      try {
        store.publishResult(result("t-593"), grant.lease_epoch + 1);
      } catch (e) {
        wrongEpoch = e;
      }

      // 步骤 2：调用 publishResult(…) 并断言该侧可观测结果
      expect(wrongTask?.code).toBe("LeaseLost");
      expect(wrongTask?.status).toBe(409);
      expect(wrongTask?.message).toBe("execution lease was lost");
      expect(wrongEpoch?.code).toBe("LeaseLost");
      expect(wrongEpoch?.status).toBe(409);
      // 两个失败都没有写库（publishResult 的整个事务回滚）
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);

      // 步骤 3：构造使该分支取假的输入——两个操作数都为假（task_id 与 epoch 都对得上）
      // 步骤 4：再次调用 publishResult(…) 并断言取假侧结果；两侧都必须被观测到
      store.publishResult(result("t-593"), grant.lease_epoch);
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);
      expect((store.db.prepare("SELECT generation FROM runs WHERE task_id='t-593'").get() as any).generation).toBe(2);
    } finally {
      store.close();
    }
  });

});
