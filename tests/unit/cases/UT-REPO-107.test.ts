/**
 * Case ID: UT-REPO-107  ·  STATUS: real
 *
 * 责任：分支 L242 `if (slot.task_id !== command.task_id || slot.…`（if；store.ts）
 * 维度坐标：`mutateRun` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-107.md（脚本的唯一依据）
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

describe("UT-REPO-107 · mutateRun · 并发/可重入 × 并发对偶/交错", () => {
  it("raises LeaseLost when the execution slot no longer matches the command", async () => {
    const store = newStore();
    try {
      accept(store, task("t-107a"));
      accept(store, task("t-107b"));
      const grant = store.tryClaimSlot("owner", "boot") as { task_id: string; lease_epoch: number };
      expect(grant.task_id).toBe("t-107a");

      // 步骤 1：构造使 store.ts:242 的分支（if：`slot.task_id !== command.task_id || slot.lease_epoch !== command.expected_lease_epoch`）取真的输入
      //         ——① slot 属于别的任务；② epoch 与执行位当前租约不符
      // 步骤 2：调用 mutateRun(…) 并断言该侧可观测结果
      let otherTaskErr: any = null;
      try {
        store.mutateRun({
          task_id: "t-107b",
          expected_generation: 1,
          expected_lease_epoch: grant.lease_epoch,
          mutation: () => {},
        });
      } catch (e) {
        otherTaskErr = e;
      }
      let epochErr: any = null;
      try {
        store.mutateRun({
          task_id: "t-107a",
          expected_generation: 1,
          expected_lease_epoch: grant.lease_epoch + 1,
          mutation: () => {},
        });
      } catch (e) {
        epochErr = e;
      }
      expect(otherTaskErr?.constructor?.name).toBe("PikoError");
      expect(otherTaskErr?.code).toBe("LeaseLost");
      expect(otherTaskErr?.status).toBe(409);
      expect(otherTaskErr?.message).toBe("lease moved");
      expect(epochErr?.code).toBe("LeaseLost");
      expect(epochErr?.message).toBe("lease moved");
      // 取真侧没有任何写入
      expect(store.generation("t-107a")).toBe(1);
      expect(store.generation("t-107b")).toBe(1);

      // 步骤 3：构造使该分支取假的输入——slot.task_id 与 command.task_id 相同且 epoch 相符
      // 步骤 4：再次调用 mutateRun(…) 并断言取假侧结果（两侧都被观测到）
      const generation = store.mutateRun({
        task_id: "t-107a",
        expected_generation: 1,
        expected_lease_epoch: grant.lease_epoch,
        mutation: (r: any) => {
          r.state = "Running";
        },
      });
      expect(generation).toBe(2);
      expect(store.generation("t-107a")).toBe(2);
      expect(store.getRun("t-107a").state).toBe("Running");
      expect(store.readSlot().task_id).toBe("t-107a");
      expect(store.readSlot().lease_epoch).toBe(grant.lease_epoch);
    } finally {
      store.close();
    }
  });

});
