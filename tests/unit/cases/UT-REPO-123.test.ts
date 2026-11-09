/**
 * Case ID: UT-REPO-123  ·  STATUS: real
 *
 * 责任：分支 L262 `!this.db.prepare("SELECT 1 FROM results WHERE…`（!；store.ts）
 * 维度坐标：`getRun` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-123.md（脚本的唯一依据）
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

describe("UT-REPO-123 · getRun · 状态分支 × 合法迁移", () => {

  it("reports result_available false when no result row exists", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条已受理但没有 result 行的 task
      store.createOrGet(task("gr-123"), "slinky", 10);

      // 步骤 2：调用 getRun("gr-123")
      const view = store.getRun("gr-123");

      // 步骤 3：断言逐值对账——! 命中，result_available 为假
      expect(view.result_available).toBe(false);
      expect(store.db.prepare("SELECT count(*) n FROM results").get()).toEqual({ n: 0 });
    } finally {
      store.close();
    }
  });

});
