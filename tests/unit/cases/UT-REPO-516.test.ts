/**
 * Case ID: UT-REPO-516  ·  STATUS: real
 *
 * 责任：分支 L627 `if (r.discussion_intake_state === "Closing")`（if；store.ts）
 * 维度坐标：`tryCloseIntake` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-516.md（脚本的唯一依据）
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

describe("UT-REPO-516 · tryCloseIntake · 状态分支 × 合法迁移", () => {

  it("returns true when the intake is already Closing", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 store.ts:627 的 if (r.discussion_intake_state === "Closing") 取真的输入
      store.createOrGet(discussionTask("tc-516", "!room:516", "$evt"), "slinky", 10, "hello");
      store.markTurn("tc-516", "$evt", "Consumed");
      store.db
        .prepare("INSERT OR IGNORE INTO run_sessions VALUES(?,?,'main',NULL,NULL,NULL,?)")
        .run("tc-516", "tc-516", 1);
      store.db
        .prepare("UPDATE runs SET discussion_intake_state='Closing' WHERE task_id=?")
        .run("tc-516");

      // 步骤 2：调用 tryCloseIntake("tc-516", 1)
      const closed = store.tryCloseIntake("tc-516", 1);

      // 步骤 3：断言逐值对账——已是 Closing，幂等返回 true，状态不再变化
      expect(closed).toBe(true);
      expect(store.getRun("tc-516").discussion_intake_state).toBe("Closing");
    } finally {
      store.close();
    }
  });

});
