/**
 * Case ID: UT-REPO-540  ·  STATUS: real
 *
 * 责任：分支 L668 `!!(this.db.prepare("SELECT cancel_requested F…`（!；store.ts）
 * 维度坐标：`cancelRequested` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-540.md（脚本的唯一依据）
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

describe("UT-REPO-540 · cancelRequested · 状态分支 × 合法迁移", () => {

  it("returns true when cancel has been requested", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 store.ts:668 的 !! 命中——已请求取消的 run
      store.createOrGet(task("cr-540"), "slinky", 10);
      store.cancel("cr-540");

      // 步骤 2：调用 cancelRequested("cr-540")
      const requested = store.cancelRequested("cr-540");

      // 步骤 3：断言逐值对账——!! 命中，结果为真
      expect(requested).toBe(true);
    } finally {
      store.close();
    }
  });

});
