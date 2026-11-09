/**
 * Case ID: UT-REPO-638  ·  STATUS: real
 *
 * 责任：分支 L816 `if (!identity)`（if；store.ts）
 * 维度坐标：`purge` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-638.md（脚本的唯一依据）
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

describe("UT-REPO-638 · purge · 状态分支 × 合法迁移", () => {
  it("skips a row whose task identity does not exist", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:816 的分支（if：`if (!identity)`）取真的输入——scope 指向不存在的任务
      accept(store, task("t1"));
      // 步骤 2：调用 purge 并断言该侧可观测结果
            const out = store.purge({ task_id: "ghost" });
            const rows = store.db.prepare("SELECT count(*) n FROM tasks").get() as any;
            // 步骤 3：构造使该分支取假的输入——任务存在
            const real = store.purge({ task_id: "t1" });
      // 步骤 3：断言——取真侧 continue（跳过），removed 为 0；取假侧正常墓碑化
            expect(out).toEqual({ removed: 0, tombstones: 0 });
            expect(rows.n).toBe(1);
            expect(real).toEqual({ removed: 1, tombstones: 1 });
    } finally {
      store.close();
    }
  });

});
