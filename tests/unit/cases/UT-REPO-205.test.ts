/**
 * Case ID: UT-REPO-205  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:410）
 * 维度坐标：`releaseSlot` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-205.md（脚本的唯一依据）
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

describe("UT-REPO-205 · releaseSlot · 字符串/路径/枚举输入 × 空", () => {
  it("returns false for an empty taskId (no matching slot row)", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 taskId——''（空串）、null（显式空值）三态中的前两态；
      // 其余参数取合法等价类（合法的 epoch）
      accept(store, task("t1"));
      store.tryClaimSlot("owner-1", "boot-1");
      // 步骤 2：调用 releaseSlot
            const emptyId = store.releaseSlot("", 1);
            const nullId = store.releaseSlot(null as any, 1);
            const slot = store.readSlot();
      // 步骤 3：断言——实现的真实语义：releaseSlot 对未知 taskId 不抛 typed 错，
            // 只是 UPDATE 匹配 0 行 → 返回 false，槽位保持原状（store.ts:410 无显式校验语句）
            expect(emptyId).toBe(false);
            expect(nullId).toBe(false);
            expect(slot.task_id).toBe("t1");
            expect(slot.owner_id).toBe("owner-1");
    } finally {
      store.close();
    }
  });

});
