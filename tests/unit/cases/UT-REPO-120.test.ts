/**
 * Case ID: UT-REPO-120  ·  STATUS: real
 *
 * 责任：分支 L257 `!r`（!；store.ts）
 * 维度坐标：`getRun` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-120.md（脚本的唯一依据）
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

describe("UT-REPO-120 · getRun · 状态分支 × 合法迁移", () => {

  it("negates the run lookup and raises NotFound for an unknown task", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 store.ts:257 的 !r 取真的输入——完全未知的 task_id
      // 步骤 2：调用 getRun("gr-120-absent")
      let err: any = null;
      try {
        store.getRun("gr-120-absent");
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言逐值对账——!r 为真且 tasks 里也查不到，落入 NotFound 分支
      expect((err as any).code).toBe("NotFound");
      expect((err as any).message).toBe("task not found");
    } finally {
      store.close();
    }
  });

});
