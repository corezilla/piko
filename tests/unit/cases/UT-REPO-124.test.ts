/**
 * Case ID: UT-REPO-124  ·  STATUS: real
 *
 * 责任：分支 L272 `!!r.cancel_requested`（!；store.ts）
 * 维度坐标：`getRun` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-124.md（脚本的唯一依据）
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

describe("UT-REPO-124 · getRun · 状态分支 × 合法迁移", () => {

  it("reports cancel_requested true after a cancel request", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条已受理的 Queued task 并请求取消
      store.createOrGet(task("gr-124"), "slinky", 10);
      store.cancel("gr-124");

      // 步骤 2：调用 getRun("gr-124")
      const view = store.getRun("gr-124");

      // 步骤 3：断言逐值对账——!!r.cancel_requested 命中，视图为真
      expect(view.cancel_requested).toBe(true);
      expect(
        (store.db.prepare("SELECT cancel_requested FROM runs WHERE task_id=?").get("gr-124") as any)
          .cancel_requested,
      ).toBe(1);
    } finally {
      store.close();
    }
  });

});
