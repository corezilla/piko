/**
 * Case ID: UT-REPO-634  ·  STATUS: real
 *
 * 责任：参数 `scope: { task_id: string } | "all"` 的 `超长` 类（store.ts:804）
 * 维度坐标：`purge` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-634.md（脚本的唯一依据）
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

describe("UT-REPO-634 · purge · 字符串/路径/枚举输入 × 超长", () => {
  it("purges nothing for an over-long task id", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 scope——{ task_id: 长度 2×上限 = 8192 }；其余参数取合法等价类
      accept(store, task("t1"));
      const longId = "t".repeat(8192);
      // 步骤 2：调用 purge
            const out = store.purge({ task_id: longId });
            const rows = store.db.prepare("SELECT count(*) n FROM tasks").get() as any;
      // 步骤 3：断言——超长 task_id 匹配不到行 → removed 0，且 t1 未被波及
            expect(out).toEqual({ removed: 0, tombstones: 0 });
            expect(rows.n).toBe(1);
            expect((store.db.prepare("SELECT identity_state FROM tasks WHERE task_id='t1'").get() as any).identity_state).toBe("Active");
    } finally {
      store.close();
    }
  });

});
