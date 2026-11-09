/**
 * Case ID: UT-REPO-515  ·  STATUS: real
 *
 * 责任：分支 L626 `!r`（!；store.ts）
 * 维度坐标：`tryCloseIntake` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-515.md（脚本的唯一依据）
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

describe("UT-REPO-515 · tryCloseIntake · 状态分支 × 合法迁移", () => {

  it("negates the session-joined lookup and refuses to close", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 store.ts:626 的 !r 取真的输入——run 行存在但没有匹配的 run_sessions 行
      store.createOrGet(discussionTask("tc-515", "!room:515", "$evt"), "slinky", 10, "hello");
      store.markTurn("tc-515", "$evt", "Consumed");

      // 步骤 2：调用 tryCloseIntake("tc-515", 1)
      const closed = store.tryCloseIntake("tc-515", 1);

      // 步骤 3：断言逐值对账——EXISTS(lease_epoch=1) 不成立，查询返回 undefined，返回 false
      expect(closed).toBe(false);
      expect(store.getRun("tc-515").discussion_intake_state).toBe("Open");
    } finally {
      store.close();
    }
  });

});
