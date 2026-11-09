/**
 * Case ID: UT-REPO-106  ·  STATUS: real
 *
 * 责任：分支 L240 `if (command.expected_lease_epoch !== undefine…`（if；store.ts）
 * 维度坐标：`mutateRun` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-106.md（脚本的唯一依据）
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
import { PikoError } from "../../../src/types.js";

describe("UT-REPO-106 · mutateRun · 并发/可重入 × 并发对偶/交错", () => {

  it("checks the lease epoch only when expected_lease_epoch is given", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:240 的分支（if：`if (command.expected_lease_epoch !== undefined)`）取真的输入
      accept(store, task("t-106"));
      const grant = store.tryClaimSlot("owner", "boot");
      expect(grant).toEqual({ task_id: "t-106", lease_epoch: 1 });

      // 步骤 2：调用 mutateRun(…)，断言该侧可观测结果
      const wrongEpoch = (() => {
        try {
          store.mutateRun({
            task_id: "t-106",
            expected_generation: 1,
            expected_lease_epoch: 99,
            mutation: (r: any) => {
              r.state = "Running";
            },
          });
          return null;
        } catch (e) {
          return e;
        }
      })();

      // 步骤 3：断言取真侧——epoch 不符抛 typed LeaseLost，事务回滚、generation 不动
      expect(wrongEpoch).toBeInstanceOf(PikoError);
      expect((wrongEpoch as any).code).toBe("LeaseLost");
      expect((wrongEpoch as any).status).toBe(409);
      expect(store.generation("t-106")).toBe(1);
      // tryClaimSlot 已把该 run 推入 Running；mutation 的状态写被回滚，generation 未变
      expect(store.getRun("t-106").state).toBe("Running");

      // 步骤 4：断言取假侧——expected_lease_epoch 为 undefined 时整块跳过，mutation 生效
      const generation = store.mutateRun({
        task_id: "t-106",
        expected_generation: 1,
        expected_lease_epoch: undefined,
        mutation: (r: any) => {
          r.state = "Running";
        },
      });
      expect(generation).toBe(2);
      expect(store.getRun("t-106").state).toBe("Running");
    } finally {
      store.close();
    }
  });

});
