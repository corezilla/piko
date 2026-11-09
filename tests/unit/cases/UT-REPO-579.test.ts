/**
 * Case ID: UT-REPO-579  ·  STATUS: real
 *
 * 责任：分支 L731 `loop (this.db.prepare("SELECT txn_id,state FR…`（loop；store.ts）
 * 维度坐标：`knownActions` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-579.md（脚本的唯一依据）
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

describe("UT-REPO-579 · knownActions · 状态分支 × 合法迁移", () => {
  it("iterates the matrix_sends rows into MatrixSend actions", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:731 的分支（loop：matrix_sends 行）取真的输入——一条事务
      accept(store, task("t1"));
      store.prepareMatrixSend("tx-1", "t1", 1, "sha-1");
      // 步骤 2：调用 knownActions 并断言该侧可观测结果
            const actions = store.knownActions("t1");
            // 步骤 3：构造使该分支取假的输入——没有任何事务
            const none = store.knownActions("t2-none");
      // 步骤 3：断言——取真侧每条事务产出一个 MatrixSend；取假侧（无行）不产出
            expect(actions.length).toBe(1);
            expect(actions[0].kind).toBe("MatrixSend");
            expect(actions[0].description).toBe("tx-1");
            expect(none).toEqual([]);
    } finally {
      store.close();
    }
  });

});
