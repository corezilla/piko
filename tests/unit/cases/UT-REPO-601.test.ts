/**
 * Case ID: UT-REPO-601  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `−1 通过` 类（store.ts:755）
 * 维度坐标：`finish` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-601.md（脚本的唯一依据）
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

describe("UT-REPO-601 · finish · 数值/长度上限参数 × −1 通过", () => {
  it("rejects the epoch below the slot lease with LeaseLost and writes nothing", async () => {
    const store = newStore();
    try {
      accept(store, task("t-601"));
      const grant = store.tryClaimSlot("owner-601", "boot-601") as { lease_epoch: number };

      // 步骤 1：按 `−1 通过` 类构造参数 epoch——边界值 −1（以及 0）
      // 步骤 2：调用 finish(…)
      let minusOne: any = null;
      try {
        store.finish(result("t-601"), -1);
      } catch (e) {
        minusOne = e;
      }
      let zero: any = null;
      try {
        store.finish(result("t-601"), 0);
      } catch (e) {
        zero = e;
      }

      // 步骤 3：断言——实现的真实语义：epoch 没有下界校验，
      //         −1 与 0 都只是与槽里的 lease_epoch 不等 ⇒ typed 错误 LeaseLost(409)，
      //         不是「−1 通过」；整个事务回滚，没有结果行、没有状态写
      expect(minusOne?.code).toBe("LeaseLost");
      expect(minusOne?.status).toBe(409);
      expect(minusOne?.message).toBe("execution lease was lost");
      expect(zero?.code).toBe("LeaseLost");
      expect(zero?.status).toBe(409);
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='t-601'").get() as any).state).toBe("Running");
      // 槽仍被该任务持有（未因失败被释放）
      expect(store.readSlot().task_id).toBe("t-601");
      expect(store.readSlot().lease_epoch).toBe(grant.lease_epoch);
    } finally {
      store.close();
    }
  });

});
