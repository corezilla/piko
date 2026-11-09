/**
 * Case ID: UT-REPO-605  ·  STATUS: real
 *
 * 责任：分支 L761 `run.discussion_intake_state !== "Closing" || …`（||；store.ts）
 * 维度坐标：`finish` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-605.md（脚本的唯一依据）
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

describe("UT-REPO-605 · finish · 状态分支 × 合法迁移", () => {
  it("throws DiscussionNotClosed while the intake is still open and finishes once it reaches Closing with no pending turn", async () => {
    const store = newStore();
    try {
      acceptDiscussion(store, "t-605", "!room:605");
      const grant = store.tryClaimSlot("owner-605", "boot-605") as { lease_epoch: number };

      // 步骤 1：构造使 store.ts:761 的分支（||：`run.discussion_intake_state !== \"Closing\" || pending !== 0`）
      //         取真的输入——intake 还是 Open（≠ Closing），触发轮次仍是 Pending
      expect((store.db.prepare("SELECT discussion_intake_state FROM runs WHERE task_id='t-605'").get() as any).discussion_intake_state).toBe("Open");
      expect(store.pendingTurns("t-605")).toHaveLength(1);

      // 步骤 2：调用 finish(…) 并断言该侧可观测结果
      let notClosed: any = null;
      try {
        store.finish(result("t-605"), grant.lease_epoch);
      } catch (e) {
        notClosed = e;
      }
      expect(notClosed?.code).toBe("DiscussionNotClosed");
      expect(notClosed?.status).toBe(409);
      expect(notClosed?.message).toBe("discussion result cannot complete before intake closes");
      // 事务回滚：没有结果行，状态未变
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='t-605'").get() as any).state).toBe("Running");

      // 步骤 3：构造使该分支取假的输入——intake 进入 Closing 且没有 Pending/QueuedInPi 的轮次
      store.db.prepare("UPDATE discussion_turns SET status='Consumed' WHERE task_id='t-605'").run();
      expect(store.tryCloseIntake("t-605", grant.lease_epoch)).toBe(true);
      expect((store.db.prepare("SELECT discussion_intake_state FROM runs WHERE task_id='t-605'").get() as any).discussion_intake_state).toBe("Closing");

      // 步骤 4：再次调用 finish(…) 并断言取假侧结果；两侧都必须被观测到
      store.finish(result("t-605"), grant.lease_epoch);
      expect((store.db.prepare("SELECT state,discussion_intake_state FROM runs WHERE task_id='t-605'").get() as any)).toEqual({
        state: "Completed",
        discussion_intake_state: "Closed",
      });
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
