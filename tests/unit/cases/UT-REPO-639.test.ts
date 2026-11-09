/**
 * Case ID: UT-REPO-639  ·  STATUS: real
 *
 * 责任：分支 L816 `!identity`（!；store.ts）
 * 维度坐标：`purge` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-639.md（脚本的唯一依据）
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

describe("UT-REPO-639 · purge · 状态分支 × 合法迁移", () => {
  it("negates the identity lookup exactly", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:816 的分支（!：`!identity`）取真的输入——令 identity 为假（任务不存在）
      accept(store, task("t1"));
      // 步骤 2：调用 purge 并断言该侧可观测结果
            const missing = store.purge({ task_id: "ghost" });
            // 步骤 3：构造使该分支取假的输入——identity 为真（任务存在）
            const present = store.purge({ task_id: "t1" });
      // 步骤 3：断言——identity 为假时 !identity 取真 → continue；identity 为真 → 正常处理
            expect(missing).toEqual({ removed: 0, tombstones: 0 });
            expect(present).toEqual({ removed: 1, tombstones: 1 });
    } finally {
      store.close();
    }
  });

});
