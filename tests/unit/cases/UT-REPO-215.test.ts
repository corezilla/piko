/**
 * Case ID: UT-REPO-215  ·  STATUS: real
 *
 * 责任：分支 L427 `r?.task_id`（?.；store.ts）
 * 维度坐标：`nextNeedingStaging` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-215.md（脚本的唯一依据）
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

describe("UT-REPO-215 · nextNeedingStaging · 状态分支 × 合法迁移", () => {

  it("returns the oldest pending-staging run and null when none is pending", async () => {
    const store = newStore();
    try {
      accept(store, task("t-215a", { input_refs: [{ source: "s3://a" }] }));
      accept(store, task("t-215b", { input_refs: [{ source: "s3://b" }] }));
      accept(store, task("t-215c"));

      // 步骤 1：构造使 store.ts:427 的分支（?.：`r?.task_id`）取真的输入——有 pending 的 run
      // 步骤 2：调用 nextNeedingStaging(…) 并断言该侧可观测结果
      expect(store.nextNeedingStaging()).toBe("t-215a");
      expect(store.inputStaging("t-215a").state).toBe("pending");
      expect(store.inputStaging("t-215c").state).toBe("none");

      // 步骤 3：构造使该分支取假的输入——没有任何 run 处于 pending
      store.setInputStaging("t-215a", { state: "ready", fetched: [], failed: [] });
      store.setInputStaging("t-215b", { state: "failed", fetched: [], failed: [] });

      // 步骤 4：再次调用 nextNeedingStaging(…) 并断言取假侧结果（两侧都被观测到）
      expect(store.nextNeedingStaging()).toBeNull();
    } finally {
      store.close();
    }
  });

});
