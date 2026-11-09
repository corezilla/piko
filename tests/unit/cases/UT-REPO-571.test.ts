/**
 * Case ID: UT-REPO-571  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:711）
 * 维度坐标：`knownActions` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-571.md（脚本的唯一依据）
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

describe("UT-REPO-571 · knownActions · 字符串/路径/枚举输入 × 超长", () => {
  it("returns an empty list for an over-long taskId", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 taskId——长度 2×上限 = 8192；其余参数取合法等价类
      accept(store, task("t1"));
      const longId = "t".repeat(8192);
      // 步骤 2：调用 knownActions
            const actions = store.knownActions(longId);
      // 步骤 3：断言——超长 taskId 匹配不到任何行 → 空数组
            expect(actions).toEqual([]);
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
