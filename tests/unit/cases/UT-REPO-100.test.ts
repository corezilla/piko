/**
 * Case ID: UT-REPO-100  ·  STATUS: real
 *
 * 责任：参数 `command: FencedRunCommand` 的 `边界(上/下/零/空/满)` 类（store.ts:232）
 * 维度坐标：`mutateRun` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-100.md（脚本的唯一依据）
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

describe("UT-REPO-100 · mutateRun · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {

  it("rejects the out-of-range fences and leaves the run unwritten", async () => {
    const store = newStore();
    try {
      accept(store, task("t-100"));

      // 步骤 1：按 `边界(上/下/零/空/满)` 类构造 command——expected_generation 下界 0、
      //         expected_state_in 空数组、expected_lease_epoch 下界 0；其余参数取合法等价类
      // 步骤 2：调用 mutateRun(…)（store.ts:232）
      let belowErr: any = null;
      try {
        store.mutateRun({ task_id: "t-100", expected_generation: 0, mutation: () => {} });
      } catch (e) {
        belowErr = e;
      }
      let emptyStateErr: any = null;
      try {
        store.mutateRun({ task_id: "t-100", expected_generation: 1, expected_state_in: [], mutation: () => {} });
      } catch (e) {
        emptyStateErr = e;
      }
      let zeroEpochErr: any = null;
      try {
        store.mutateRun({
          task_id: "t-100",
          expected_generation: 1,
          expected_lease_epoch: 0,
          mutation: () => {},
        });
      } catch (e) {
        zeroEpochErr = e;
      }

      // 步骤 3：断言逐值对账——实现只有下界守卫：generation 0 与空 expected_state_in 被
      //         FencedWrite 拒绝，epoch 0 被 LeaseLost 拒绝；三���拒绝后 run 一字未写
      expect(belowErr?.constructor?.name).toBe("PikoError");
      expect(belowErr?.code).toBe("FencedWrite");
      expect(belowErr?.message).toBe("generation moved");
      expect(emptyStateErr?.code).toBe("FencedWrite");
      expect(emptyStateErr?.message).toBe("state moved");
      expect(zeroEpochErr?.code).toBe("LeaseLost");
      expect(zeroEpochErr?.message).toBe("lease moved");
      expect(store.getRun("t-100").generation).toBe(1);
      expect(store.getRun("t-100").state).toBe("Queued");
      expect(store.readSlot().task_id).toBeNull();
    } finally {
      store.close();
    }
  });

});
