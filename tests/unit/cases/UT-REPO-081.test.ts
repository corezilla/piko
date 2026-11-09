/**
 * Case ID: UT-REPO-081  ·  STATUS: real
 *
 * 责任：分支 L209 `? task.discussion :`（ternary；store.ts）
 * 维度坐标：`createOrGet` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-081.md（脚本的唯一依据）
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

describe("UT-REPO-081 · createOrGet · 状态分支 × 合法迁移", () => {

  it("opens the discussion intake when the task carries a discussion", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 store.ts:209 三元的两个代表值——带 discussion 与不带 discussion
      // 步骤 2：调用 createOrGet(...)
      store.createOrGet(discussionTask("co-081-a"), "slinky", 10);
      store.createOrGet(task("co-081-b"), "slinky", 10);

      // 步骤 3：断言逐值对账——真侧写 "Open"，假侧写 "Disabled"
      expect(store.getRun("co-081-a").discussion_intake_state).toBe("Open");
      expect(store.getRun("co-081-b").discussion_intake_state).toBe("Disabled");
    } finally {
      store.close();
    }
  });

});
