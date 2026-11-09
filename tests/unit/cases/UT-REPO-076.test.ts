/**
 * Case ID: UT-REPO-076  ·  STATUS: real
 *
 * 责任：分支 L188 `if (!sameTask(JSON.parse(old.task_json), task…`（if；store.ts）
 * 维度坐标：`createOrGet` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-076.md（脚本的唯一依据）
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

describe("UT-REPO-076 · createOrGet · 状态分支 × 合法迁移", () => {

  it("returns conflict when the same task_id carries different content", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:188 的 if (!sameTask(...)) 取真的输入——同 ID 不同 instruction
      store.createOrGet(task("co-076", { instruction: "first" }), "slinky", 10);

      // 步骤 2：调用 createOrGet(同 task_id，不同内容)
      const outcome = store.createOrGet(task("co-076", { instruction: "second" }), "slinky", 10);

      // 步骤 3：断言逐值对账——冲突被拒绝，原 run 不变
      expect(outcome).toEqual({ kind: "conflict" });
      expect(store.getRun("co-076").state).toBe("Queued");
      expect(store.db.prepare("SELECT count(*) n FROM runs").get()).toEqual({ n: 1 });
    } finally {
      store.close();
    }
  });

});
