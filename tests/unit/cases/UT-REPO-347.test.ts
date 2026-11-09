/**
 * Case ID: UT-REPO-347  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:494）
 * 维度坐标：`pendingTurns` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-347.md（脚本的唯一依据）
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

describe("UT-REPO-347 · pendingTurns · 字符串/路径/枚举输入 × 超长", () => {

  it("returns an empty list for an over-long task id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 taskId 的超长类——长度 2×4096＝8192
      store.createOrGet(discussionTask("pt-347"), "slinky", 10, "hello");

      // 步骤 2：调用 pendingTurns(long)
      const turns = store.pendingTurns("t".repeat(8192));

      // 步骤 3：断言逐值对账——实现对 taskId 无长度上限，超长串只是不匹配任何任务
      expect(turns).toEqual([]);
    } finally {
      store.close();
    }
  });

});
