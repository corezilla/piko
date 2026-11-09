/**
 * Case ID: UT-REPO-598  ·  STATUS: real
 *
 * 责任：参数 `result: AgentResult` 的 `非法值` 类（store.ts:755）
 * 维度坐标：`finish` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-598.md（脚本的唯一依据）
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

describe("UT-REPO-598 · finish · 纯函数/无副作用 × 非法值", () => {

  it("refuses an illegal terminal state and rolls the whole transaction back", async () => {
    const store = newStore();
    try {
      accept(store, task("t-598"));
      const grant = store.tryClaimSlot("worker", "boot") as { task_id: string; lease_epoch: number };

      // 步骤 1：按 `非法值` 类构造参数 result——state 取不在 TerminalState 枚举里的 "Bogus"
      // 步骤 2：调用 finish(…)
      let err: any = null;
      try {
        store.finish(result("t-598", { state: "Bogus" as never }), grant.lease_epoch);
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言——实现的真实行为：非法 state 不是被 PikoError 拒绝，而是撞
      //         runs.state 的 CHECK 约束；整笔事务回滚——结果行没写、run 仍在 Running、
      //         执行位仍被持有
      expect(err?.constructor?.name).toBe("Error");
      expect(err?.message).toMatch(/CHECK constraint failed: state IN/);
      expect(store.db.prepare("SELECT count(*) n FROM results").get()).toEqual({ n: 0 });
      expect(store.getRun("t-598").state).toBe("Running");
      expect(store.readSlot().task_id).toBe("t-598");
    } finally {
      store.close();
    }
  });

});
