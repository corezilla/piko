/**
 * Case ID: UT-REPO-206  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:410）
 * 维度坐标：`releaseSlot` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-206.md（脚本的唯一依据）
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

describe("UT-REPO-206 · releaseSlot · 字符串/路径/枚举输入 × 超长", () => {
  it("returns false for an over-long taskId", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 taskId——长度 2×上限 = 8192；其余参数取合法等价类
      accept(store, task("t1"));
      store.tryClaimSlot("owner-1", "boot-1");
      const longId = "x".repeat(8192);
      // 步骤 2：调用 releaseSlot
            const released = store.releaseSlot(longId, 1);
            const slot = store.readSlot();
      // 步骤 3：断言——超长 taskId 匹配不到行 → false；槽位不受影响
            expect(released).toBe(false);
            expect(slot.task_id).toBe("t1");
            expect(slot.lease_epoch).toBe(1);
    } finally {
      store.close();
    }
  });

});
