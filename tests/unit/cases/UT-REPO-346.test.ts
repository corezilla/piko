/**
 * Case ID: UT-REPO-346  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:494）
 * 维度坐标：`pendingTurns` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-346.md（脚本的唯一依据）
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

describe("UT-REPO-346 · pendingTurns · 字符串/路径/枚举输入 × 空", () => {

  it("returns an empty list for an empty task id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 taskId 的空类——''（空串）
      store.createOrGet(discussionTask("pt-346"), "slinky", 10, "hello");

      // 步骤 2：调用 pendingTurns("")
      const turns = store.pendingTurns("");

      // 步骤 3：断言逐值对账——不匹配任何任务，返回空数组（不抛错）
      expect(turns).toEqual([]);
      expect(turns).toHaveLength(0);
    } finally {
      store.close();
    }
  });

});
