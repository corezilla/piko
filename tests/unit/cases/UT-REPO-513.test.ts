/**
 * Case ID: UT-REPO-513  ·  STATUS: real
 *
 * 责任：分支 L622 `if (pending)`（if；store.ts）
 * 维度坐标：`tryCloseIntake` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-513.md（脚本的唯一依据）
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

describe("UT-REPO-513 · tryCloseIntake · 状态分支 × 合法迁移", () => {

  it("refuses to close while a discussion turn is still pending", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 store.ts:622 的 if (pending) 取真的输入——触发 turn 仍是 Pending
      store.createOrGet(discussionTask("tc-513", "!room:513", "$evt"), "slinky", 10, "hello");
      store.db
        .prepare("INSERT OR IGNORE INTO run_sessions VALUES(?,?,'main',NULL,NULL,NULL,?)")
        .run("tc-513", "tc-513", 1);

      // 步骤 2：调用 tryCloseIntake("tc-513", 1)
      const closed = store.tryCloseIntake("tc-513", 1);

      // 步骤 3：断言逐值对账——pending 计数为 1，先被 pending 守卫拦下，返回 false
      expect(closed).toBe(false);
      expect(store.getRun("tc-513").discussion_intake_state).toBe("Open");
      expect(store.pendingTurns("tc-513")).toHaveLength(1);
    } finally {
      store.close();
    }
  });

});
