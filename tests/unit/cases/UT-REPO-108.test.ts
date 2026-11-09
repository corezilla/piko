/**
 * Case ID: UT-REPO-108  ·  STATUS: real
 *
 * 责任：分支 L242 `slot.task_id !== command.task_id || slot.leas…`（||；store.ts）
 * 维度坐标：`mutateRun` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-108.md（脚本的唯一依据）
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

describe("UT-REPO-108 · mutateRun · 并发/可重入 × 并发对偶/交错", () => {

  it("rejects a mismatched lease holder or epoch and accepts the exact one", async () => {
    const store = newStore();
    try {
      accept(store, task("t-108a"));
      accept(store, task("t-108b"));
      // 步骤 1：构造前置状态——执行位被最旧的 t-108a 持有
      const grant = store.tryClaimSlot("worker", "boot") as { task_id: string; lease_epoch: number };
      expect(grant.task_id).toBe("t-108a");

      // 步骤 2：取真侧之一——slot.task_id ≠ command.task_id（t-108b 不在执行位上）
      let otherErr: any = null;
      try {
        store.mutateRun({
          task_id: "t-108b",
          expected_generation: 1,
          expected_lease_epoch: grant.lease_epoch,
          mutation: () => {},
        });
      } catch (e) {
        otherErr = e;
      }
      // 步骤 2：取真侧之二——slot.lease_epoch ≠ command.expected_lease_epoch
      let epochErr: any = null;
      try {
        store.mutateRun({
          task_id: "t-108a",
          expected_generation: 1,
          expected_lease_epoch: grant.lease_epoch + 1,
          mutation: () => {},
        });
      } catch (e) {
        epochErr = e;
      }
      expect(otherErr?.code).toBe("LeaseLost");
      expect(epochErr?.code).toBe("LeaseLost");
      expect(store.getRun("t-108a").generation).toBe(1);
      expect(store.getRun("t-108b").generation).toBe(1);

      // 步骤 3：构造使该分支取假的输入——task_id 与 epoch 都对上
      // 步骤 4：再次调用 mutateRun(…) 并断言取假侧结果（两侧都被观测到）
      const generation = store.mutateRun({
        task_id: "t-108a",
        expected_generation: 1,
        expected_lease_epoch: grant.lease_epoch,
        mutation: (r) => {
          r.state = "Running";
        },
      });
      expect(generation).toBe(2);
      expect(store.getRun("t-108a").state).toBe("Running");
    } finally {
      store.close();
    }
  });

});
