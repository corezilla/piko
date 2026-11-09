/**
 * Case ID: UT-REPO-603  ·  STATUS: real
 *
 * 责任：分支 L761 `if (result.state === "Completed" && run.discu…`（if；store.ts）
 * 维度坐标：`finish` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-603.md（脚本的唯一依据）
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

describe("UT-REPO-603 · finish · 状态分支 × 合法迁移", () => {

  it("blocks a Completed finish while intake is open and allows it once intake is closing", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:761 的分支取真的输入——discussion_intake_state='Open' 且还有待处理 turn
      accept(store, discussionTask("d1", "!r:d1"));
      const grant = store.tryClaimSlot("owner-1", "boot-1") as { task_id: string; lease_epoch: number };

      // 步骤 2：调用 finish(…) 并断言该侧可观测结果（返回值/状态/副作用）与设计一致
      let err: any = null;
      try {
        store.finish(result("d1", { state: "Completed" }), grant.lease_epoch);
      } catch (e) {
        err = e;
      }
      expect(err).not.toBeNull();
      expect(err.code).toBe("DiscussionNotClosed");
      expect(err.status).toBe(409);
      // 抛出时事务回滚：run 仍在 Running，槽未被释放，结果未落库
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='d1'").get() as any).state).toBe("Running");
      expect(store.readSlot().task_id).toBe("d1");
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);

      // 步骤 3：构造使该分支取假的输入——turn 已消费且 intake 已 Closing（无显式 else：取假即跳过该块，断言块内副作用不发生）
      store.markTurn("d1", "$e1", "Consumed");
      expect(store.tryCloseIntake("d1", grant.lease_epoch)).toBe(true);
      expect((store.db.prepare("SELECT discussion_intake_state FROM runs WHERE task_id='d1'").get() as any).discussion_intake_state).toBe("Closing");

      // 步骤 4：再次调用 finish(…) 并断言取假侧结果；两侧都必须被观测到
      store.finish(result("d1", { state: "Completed" }), grant.lease_epoch);
      const run = store.db.prepare("SELECT state, discussion_intake_state FROM runs WHERE task_id='d1'").get() as any;
      expect(run.state).toBe("Completed");
      expect(run.discussion_intake_state).toBe("Closed");
      expect(store.readSlot().task_id).toBeNull();
    } finally {
      store.close();
    }
  });

});
