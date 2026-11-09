/**
 * Case ID: UT-REPO-434  ·  STATUS: real
 *
 * 责任：分支 L545 `!!this.db.prepare("SELECT 1 FROM matrix_event…`（!；store.ts）
 * 维度坐标：`hasMatrixEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-434.md（脚本的唯一依据）
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

describe("UT-REPO-434 · hasMatrixEvent · 状态分支 × 合法迁移", () => {

  it("returns true when the event row exists", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 store.ts:545 的 !! 命中——登记一条事件
      store.recordMatrixEvent("!room:434", "$evt434", "sender");

      // 步骤 2：调用 hasMatrixEvent("!room:434", "$evt434")
      const found = store.hasMatrixEvent("!room:434", "$evt434");

      // 步骤 3：断言逐值对账——!! 为真
      expect(found).toBe(true);
    } finally {
      store.close();
    }
  });

});
