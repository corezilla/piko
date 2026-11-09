/**
 * Case ID: UT-REPO-435  ·  STATUS: real
 *
 * 责任：分支 L545 `!this.db.prepare("SELECT 1 FROM matrix_events…`（!；store.ts）
 * 维度坐标：`hasMatrixEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-435.md（脚本的唯一依据）
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

describe("UT-REPO-435 · hasMatrixEvent · 状态分支 × 合法迁移", () => {

  it("returns false when no event row exists", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 store.ts:545 的 ! 命中——登记一条事件但查另一个 key
      store.recordMatrixEvent("!room:435", "$evt435", "sender");

      // 步骤 2：调用 hasMatrixEvent("!room:435", "$other")
      const found = store.hasMatrixEvent("!room:435", "$other");

      // 步骤 3：断言逐值对账——! 为真，结果为假
      expect(found).toBe(false);
      expect(store.db.prepare("SELECT count(*) n FROM matrix_events").get()).toEqual({ n: 1 });
    } finally {
      store.close();
    }
  });

});
