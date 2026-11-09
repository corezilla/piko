/**
 * Case ID: UT-REPO-517  ·  STATUS: real
 *
 * 责任：分支 L628 `if (r.discussion_intake_state !== "Open")`（if；store.ts）
 * 维度坐标：`tryCloseIntake` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-517.md（脚本的唯一依据）
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

describe("UT-REPO-517 · tryCloseIntake · 状态分支 × 合法迁移", () => {

  it("returns false when the intake is Disabled", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 store.ts:628 的 if (r.discussion_intake_state !== "Open") 取真的输入——
      // 非讨论任务的 intake 是 Disabled
      store.createOrGet(task("tc-517"), "slinky", 10);
      store.db
        .prepare("INSERT OR IGNORE INTO run_sessions VALUES(?,?,'main',NULL,NULL,NULL,?)")
        .run("tc-517", "tc-517", 1);

      // 步骤 2：调用 tryCloseIntake("tc-517", 1)
      const closed = store.tryCloseIntake("tc-517", 1);

      // 步骤 3：断言逐值对账——Disabled 既不是 Closing 也不是 Open，返回 false
      expect(closed).toBe(false);
      expect(store.getRun("tc-517").discussion_intake_state).toBe("Disabled");
    } finally {
      store.close();
    }
  });

});
