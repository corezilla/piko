/**
 * Case ID: UT-REPO-592  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `−1 通过` 类（store.ts:745）
 * 维度坐标：`publishResult` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-592.md（脚本的唯一依据）
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

describe("UT-REPO-592 · publishResult · 数值/长度上限参数 × −1 通过", () => {

  it("rejects an epoch of minus one because the slot lease epoch never goes negative", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `−1 通过` 类构造 epoch——边界值 −1；其余参数取合法等价类
      accept(store, task("t-592"));
      const grant = store.tryClaimSlot("owner", "boot") as { task_id: string; lease_epoch: number };
      expect(grant.lease_epoch).toBe(1);

      // 步骤 2：调用 publishResult(…)
      let err: any = null;
      try {
        store.publishResult(result("t-592"), -1);
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言——实现的真实语义：publishResult 只做 slot.task_id / slot.lease_epoch 逐值比对，
      // −1 不等于当前 epoch 1 → 抛 typed LeaseLost（不是"通过"）；事务回滚，不留结果行
      expect(err).toBeInstanceOf(PikoError);
      expect((err as any).code).toBe("LeaseLost");
      expect((err as any).status).toBe(409);
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
      expect(store.generation("t-592")).toBe(1);
    } finally {
      store.close();
    }
  });

});
