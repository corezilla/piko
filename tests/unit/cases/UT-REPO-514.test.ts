/**
 * Case ID: UT-REPO-514  ·  STATUS: real
 *
 * 责任：分支 L626 `if (!r)`（if；store.ts）
 * 维度坐标：`tryCloseIntake` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-514.md（脚本的唯一依据）
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

describe("UT-REPO-514 · tryCloseIntake · 状态分支 × 合法迁移", () => {

  it("returns false when no run row matches the task id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 store.ts:626 的 if (!r) 取真的输入——未知 task_id
      // 步骤 2：调用 tryCloseIntake("tc-514-absent", 1)
      const closed = store.tryCloseIntake("tc-514-absent", 1);

      // 步骤 3：断言逐值对账——查询返回 undefined，!r 为真，返回 false（不抛错）
      expect(closed).toBe(false);
    } finally {
      store.close();
    }
  });

});
