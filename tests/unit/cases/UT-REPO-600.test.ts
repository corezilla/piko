/**
 * Case ID: UT-REPO-600  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `+1 拒绝` 类（store.ts:755）
 * 维度坐标：`finish` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-600.md（脚本的唯一依据）
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

describe("UT-REPO-600 · finish · 数值/长度上限参数 × +1 拒绝", () => {

  it("refuses to finish when the epoch is one past the current lease", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `+1 拒绝` 类构造 epoch——当前租约 epoch 为 1，边界值取 1+1=2
      accept(store, task("t-600"));
      const grant = store.tryClaimSlot("owner", "boot") as { task_id: string; lease_epoch: number };
      expect(grant.lease_epoch).toBe(1);

      // 步骤 2：调用 finish(…)
      let err: any = null;
      try {
        store.finish(result("t-600"), 2);
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言——实现的真实语义：epoch 不符 → 抛 typed LeaseLost；事务回滚，
      // run 仍是 Running、槽位未被释放、无结果行（无状态写残留）
      expect(err).toBeInstanceOf(PikoError);
      expect((err as any).code).toBe("LeaseLost");
      expect((err as any).status).toBe(409);
      expect(store.getRun("t-600").state).toBe("Running");
      expect(store.readSlot().task_id).toBe("t-600");
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
