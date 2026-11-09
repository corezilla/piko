/**
 * Case ID: UT-REPO-542  ·  STATUS: real
 *
 * 责任：分支 L668 `(this.db.prepare("SELECT cancel_requested FRO…`（?.；store.ts）
 * 维度坐标：`cancelRequested` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-542.md（脚本的唯一依据）
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

describe("UT-REPO-542 · cancelRequested · 状态分支 × 合法迁移", () => {

  it("short-circuits to false for a task id that matches no run", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造不存在的 task_id
      // 步骤 2：调用 cancelRequested("cr-542-absent")
      const requested = store.cancelRequested("cr-542-absent");

      // 步骤 3：断言逐值对账——可选链 ?. 在行不存在时给出 undefined，!!undefined 为假
      expect(requested).toBe(false);
      expect(typeof requested).toBe("boolean");
    } finally {
      store.close();
    }
  });

});
