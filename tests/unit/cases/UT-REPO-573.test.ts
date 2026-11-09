/**
 * Case ID: UT-REPO-573  ·  STATUS: real
 *
 * 责任：分支 L713 `loop (this.db .prepare("SELECT operation_id,s…`（loop；store.ts）
 * 维度坐标：`knownActions` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-573.md（脚本的唯一依据）
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

describe("UT-REPO-573 · knownActions · 状态分支 × 合法迁移", () => {
  it("iterates the model_attempts rows into ModelCall actions", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:713 的分支（loop：模型尝试行）取真的输入——两条模型尝试
      accept(store, task("t1"));
      store.reserveModel("t1", "op1", "step1", 1);
      store.reserveModel("t1", "op2", "step2", 2);
      // 步骤 2：调用 knownActions 并断言该侧可观测结果
            const actions = store.knownActions("t1");
            // 步骤 3：构造使该分支取假的输入——没有任何模型尝试
            const none = store.knownActions("t2-none");
      // 步骤 3：断言——取真侧每条模型尝试产出一个 ModelCall；取假侧（无行）不产出
            expect(actions.length).toBe(2);
            expect(actions.every((a) => a.kind === "ModelCall")).toBe(true);
            expect(actions.map((a) => a.description).sort()).toEqual(["op1/step1 attempt 1", "op2/step2 attempt 2"]);
            expect(none).toEqual([]);
    } finally {
      store.close();
    }
  });

});
