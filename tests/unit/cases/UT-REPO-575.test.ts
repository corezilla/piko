/**
 * Case ID: UT-REPO-575  ·  STATUS: real
 *
 * 责任：分支 L718 `? x.state === "Unknown" :`（ternary；store.ts）
 * 维度坐标：`knownActions` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-575.md（脚本的唯一依据）
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

describe("UT-REPO-575 · knownActions · 状态分支 × 合法迁移", () => {
  it("maps an Unknown model attempt to Unknown", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:718 的分支（ternary：`x.state === "Unknown"`）取真的输入
      accept(store, task("t1"));
      store.reserveModel("t1", "op1", "step1", 1);
      store.terminalModel("t1", "op1", "step1", 1, true);
      // 步骤 2：调用 knownActions 并断言该侧可观测结果
            const unknown = store.knownActions("t1");
            // 步骤 3：构造使该分支取假的输入——状态是 Started（既非 Terminal 也非 Unknown）
            store.reserveModel("t1", "op2", "step2", 1);
            const started = store.knownActions("t1");
      // 步骤 3：断言——取真侧 status 为 Unknown；取假侧落到 InProgress
            expect(unknown.length).toBe(1);
            expect(unknown[0].status).toBe("Unknown");
            expect(started.length).toBe(2);
            expect(started.find((a) => a.description === "op2/step2 attempt 1")?.status).toBe("InProgress");
    } finally {
      store.close();
    }
  });

});
