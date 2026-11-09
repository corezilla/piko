/**
 * Case ID: UT-REPO-591  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `+1 拒绝` 类（store.ts:745）
 * 维度坐标：`publishResult` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-591.md（脚本的唯一依据）
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

describe("UT-REPO-591 · publishResult · 数值/长度上限参数 × +1 拒绝", () => {

  it("rejects a publishResult whose epoch is one ahead of the held lease", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `+1 拒绝` 类构造参数 epoch——边界值 +1（当前 lease_epoch + 1）；其余参数取合法等价类
      accept(store, task("t1"));
      const grant = store.tryClaimSlot("owner-1", "boot-1") as { task_id: string; lease_epoch: number };
      expect(grant.lease_epoch).toBe(1);

      // 步骤 2：调用 publishResult(…)
      let err: any = null;
      try {
        store.publishResult(result("t1"), grant.lease_epoch + 1);
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言：被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      expect(err).not.toBeNull();
      expect(err.code).toBe("LeaseLost");
      expect(err.status).toBe(409);
      expect(err.message).toBe("execution lease was lost");
      // 无状态写/资源残留：没有结果行，generation 未动，槽仍在
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
      expect(store.generation("t1")).toBe(1);
      expect(store.readSlot().task_id).toBe("t1");
    } finally {
      store.close();
    }
  });

});
