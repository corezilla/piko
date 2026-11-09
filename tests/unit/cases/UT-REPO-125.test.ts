/**
 * Case ID: UT-REPO-125  ·  STATUS: real
 *
 * 责任：分支 L272 `!r.cancel_requested`（!；store.ts）
 * 维度坐标：`getRun` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-125.md（脚本的唯一依据）
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

describe("UT-REPO-125 · getRun · 状态分支 × 合法迁移", () => {

  it("reports cancel_requested false for a run that was never cancelled", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条已受理但未取消的 task
      store.createOrGet(task("gr-125"), "slinky", 10);

      // 步骤 2：调用 getRun("gr-125")
      const view = store.getRun("gr-125");

      // 步骤 3：断言逐值对账——!r.cancel_requested 命中，视图为假
      expect(view.cancel_requested).toBe(false);
      expect(
        (store.db.prepare("SELECT cancel_requested FROM runs WHERE task_id=?").get("gr-125") as any)
          .cancel_requested,
      ).toBe(0);
    } finally {
      store.close();
    }
  });

});
