/**
 * Case ID: UT-REPO-580  ·  STATUS: real
 *
 * 责任：分支 L732 `? x.state === "Sent" :`（ternary；store.ts）
 * 维度坐标：`knownActions` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-580.md（脚本的唯一依据）
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

describe("UT-REPO-580 · knownActions · 状态分支 × 合法迁移", () => {
  it("maps a Sent matrix transaction to Completed and others to Unknown", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:732 的分支（ternary：`x.state === "Sent"`）取真的输入
      accept(store, task("t1"));
      store.prepareMatrixSend("tx-sent", "t1", 1, "sha-1");
      store.prepareMatrixSend("tx-pending", "t1", 2, "sha-2");
      store.finishMatrixSend("tx-sent", "event-1");
      // 步骤 2：调用 knownActions 并断言该侧可观测结果
            const actions = store.knownActions("t1");
            // 步骤 3：构造使该分支取假的输入——状态是 Pending
            const pending = actions.find((a) => a.description === "tx-pending");
      // 步骤 3：断言——取真侧（Sent）status 为 Completed；取假侧（Pending）status 为 Unknown
            expect(actions.length).toBe(2);
            expect(actions.find((a) => a.description === "tx-sent")?.status).toBe("Completed");
            expect(pending?.status).toBe("Unknown");
            expect(pending?.kind).toBe("MatrixSend");
    } finally {
      store.close();
    }
  });

});
