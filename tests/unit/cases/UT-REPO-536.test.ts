/**
 * Case ID: UT-REPO-536  ·  STATUS: real
 *
 * 责任：返回站点 L664 值 `{ outcome: "StopRequested", requested_a…` 逐值断言（store.ts）
 * 维度坐标：`cancel` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-536.md（脚本的唯一依据）
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

describe("UT-REPO-536 · cancel · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the StopRequested outcome shape for a running run", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:664 的返回站点被到达的输入——一条 Running 的 run（既不终态也不在 Queued）
      accept(store, task("t1"));
      const grant = store.tryClaimSlot("owner-1", "boot-1") as { task_id: string; lease_epoch: number };
      expect(grant.task_id).toBe("t1");

      // 步骤 2：调用 cancel(…)
      const outcome = store.cancel("t1");

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(Object.keys(outcome).sort()).toEqual(["outcome", "requested_at"]);
      expect(outcome.outcome).toBe("StopRequested");
      expect(typeof outcome.requested_at).toBe("string");
      expect(outcome.requested_at.length).toBeGreaterThan(0);
      expect(Number.isNaN(Date.parse(outcome.requested_at))).toBe(false);
      // 无未声明副作用：StopRequested 不写结果行
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
