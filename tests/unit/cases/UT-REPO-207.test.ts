/**
 * Case ID: UT-REPO-207  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:410）
 * 维度坐标：`releaseSlot` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-207.md（脚本的唯一依据）
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

describe("UT-REPO-207 · releaseSlot · 字符串/路径/枚举输入 × 注入字符", () => {
  it("returns false for an injection-shaped taskId without touching other tables", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 taskId——SQL 注入串、路径穿越串、控制字符串
      accept(store, task("t1"));
      store.tryClaimSlot("owner-1", "boot-1");
      const ids = ["'; DROP TABLE runs;--", "../../etc/piko", "a\u0001b"];
      // 步骤 2：调用 releaseSlot
            const released = store.releaseSlot(ids[0], 1);
            const slot = store.readSlot();
      // 步骤 3：断言——参数化绑定：注入串命中不到行 → false；runs 表不受影响
            expect(released).toBe(false);
            expect(slot.task_id).toBe("t1");
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
