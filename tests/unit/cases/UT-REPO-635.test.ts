/**
 * Case ID: UT-REPO-635  ·  STATUS: real
 *
 * 责任：参数 `scope: { task_id: string } | "all"` 的 `注入字符` 类（store.ts:804）
 * 维度坐标：`purge` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-635.md（脚本的唯一依据）
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

describe("UT-REPO-635 · purge · 字符串/路径/枚举输入 × 注入字符", () => {
  it("purges nothing for an injection-shaped task id", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 scope——{ task_id: SQL 注入串 }；其余参数取合法等价类
      accept(store, task("t1"));
      const taskId = "'; DROP TABLE tasks;--";
      // 步骤 2：调用 purge
            const out = store.purge({ task_id: taskId });
            const rows = store.db.prepare("SELECT count(*) n FROM tasks").get() as any;
      // 步骤 3：断言——参数化绑定：注入串匹配不到行 → removed 0，tasks 表完好
            expect(out).toEqual({ removed: 0, tombstones: 0 });
            expect(rows.n).toBe(1);
            expect((store.db.prepare("SELECT identity_state FROM tasks WHERE task_id='t1'").get() as any).identity_state).toBe("Active");
    } finally {
      store.close();
    }
  });

});
