/**
 * Case ID: UT-REPO-606  ·  STATUS: real
 *
 * 责任：分支 L764 `if (result.state !== "Completed")`（if；store.ts）
 * 维度坐标：`finish` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-606.md（脚本的唯一依据）
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

describe("UT-REPO-606 · finish · 状态分支 × 合法迁移", () => {

  it("abandons the pending turns only for a non-Completed result", async () => {
    const store = newStore();
    try {
      accept(store, task("t-606a"));
      accept(store, task("t-606b"));
      store.db.prepare("INSERT INTO discussion_turns VALUES('t-606a','$e1',1,'Pending','v',NULL,NULL)").run();
      store.db.prepare("INSERT INTO discussion_turns VALUES('t-606b','$e1',1,'Pending','v',NULL,NULL)").run();

      // 步骤 1：构造使 store.ts:764 的分支（if：`if (result.state !== "Completed")`）取真的输入
      const grantA = store.tryClaimSlot("worker", "boot") as { lease_epoch: number };
      store.finish(result("t-606a", { state: "Failed" }), grantA.lease_epoch);

      // 步骤 2：调用 finish(…) 并断言该侧可观测结果
      expect(
        (store.db.prepare("SELECT status FROM discussion_turns WHERE task_id='t-606a'").get() as any).status,
      ).toBe("Abandoned");

      // 步骤 3：构造使该分支取假的输入——result.state ＝ "Completed"
      // 步骤 4：再次调用 finish(…) 并断言取假侧结果（两侧都被观测到）
      const grantB = store.tryClaimSlot("worker", "boot") as { lease_epoch: number };
      store.finish(result("t-606b"), grantB.lease_epoch);
      const rows = store.db.prepare("SELECT task_id,status FROM discussion_turns ORDER BY task_id").all() as any[];
      expect(rows).toEqual([
        { task_id: "t-606a", status: "Abandoned" },
        { task_id: "t-606b", status: "Pending" },
      ]);
    } finally {
      store.close();
    }
  });

});
