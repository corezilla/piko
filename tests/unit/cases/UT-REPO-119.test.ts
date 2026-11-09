/**
 * Case ID: UT-REPO-119  ·  STATUS: real
 *
 * 责任：分支 L257 `if (!r)`（if；store.ts）
 * 维度坐标：`getRun` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-119.md（脚本的唯一依据）
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

describe("UT-REPO-119 · getRun · 状态分支 × 合法迁移", () => {

  it("falls back to the tasks lookup when no run row matches", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造无 run 行的 task_id（tasks 行存在但 runs 行不存在）
      store.createOrGet(task("gr-119"), "slinky", 10);
      store.db.prepare("DELETE FROM runs WHERE task_id=?").run("gr-119");

      // 步骤 2：调用 getRun("gr-119")
      let err: any = null;
      try {
        store.getRun("gr-119");
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言该分支被走到——tasks 行仍是 Active，故抛 NotFound（不是 Gone）
      expect((err as any).code).toBe("NotFound");
      expect((err as any).status).toBe(404);
    } finally {
      store.close();
    }
  });

});
