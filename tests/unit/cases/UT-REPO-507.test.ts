/**
 * Case ID: UT-REPO-507  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:619）
 * 维度坐标：`tryCloseIntake` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-507.md（脚本的唯一依据）
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

describe("UT-REPO-507 · tryCloseIntake · 字符串/路径/枚举输入 × 空", () => {

  it("returns false for an empty task id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 taskId 的空类——''（空串）
      store.createOrGet(discussionTask("tc-507"), "slinky", 10, "hello");

      // 步骤 2：调用 tryCloseIntake("", 1)
      const closed = store.tryCloseIntake("", 1);

      // 步骤 3：断言逐值对账——空串不匹配任何 run，返回 false（不抛错）
      expect(closed).toBe(false);
      expect(store.getRun("tc-507").discussion_intake_state).toBe("Open");
    } finally {
      store.close();
    }
  });

});
