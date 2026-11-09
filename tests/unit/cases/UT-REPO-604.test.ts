/**
 * Case ID: UT-REPO-604  ·  STATUS: real
 *
 * 责任：分支 L761 `result.state === "Completed" && run.discussio…`（&&；store.ts）
 * 维度坐标：`finish` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-604.md（脚本的唯一依据）
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

describe("UT-REPO-604 · finish · 状态分支 × 合法迁移", () => {

  it("blocks a Completed result while the discussion intake is still open", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:761 的分支（&&）取真的输入——intake=Open 且有 Pending turn
      acceptDiscussion(store, "t-604", "!room:604");
      const grant = store.tryClaimSlot("owner", "boot") as { task_id: string; lease_epoch: number };

      // 步骤 2：调用 finish(…) 并断言该侧可观测结果
      let err: any = null;
      try {
        store.finish(result("t-604", { state: "Completed" }), grant.lease_epoch);
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言取真侧——抛 typed DiscussionNotClosed，run 仍是 Running，无结果行
      expect(err).toBeInstanceOf(PikoError);
      expect((err as any).code).toBe("DiscussionNotClosed");
      expect((err as any).status).toBe(409);
      expect(store.getRun("t-604").state).toBe("Running");
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);

      // 步骤 4：断言取假侧——turn 消费完、intake 关到 Closing 后同一个 Completed 结果被接受
      store.markTurn("t-604", "$e1", "Consumed", "entry-1", "op-1");
      expect(store.tryCloseIntake("t-604", grant.lease_epoch)).toBe(true);
      store.finish(result("t-604", { state: "Completed" }), grant.lease_epoch);
      expect(store.getRun("t-604").state).toBe("Completed");
      expect(store.getRun("t-604").discussion_intake_state).toBe("Closed");
    } finally {
      store.close();
    }
  });

});
