/**
 * Case ID: UT-REPO-214  ·  STATUS: real
 *
 * 责任：分支 L427 `r?.task_id ?? null`（??；store.ts）
 * 维度坐标：`nextNeedingStaging` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-214.md（脚本的唯一依据）
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

describe("UT-REPO-214 · nextNeedingStaging · 状态分支 × 合法迁移", () => {
  it("returns the pending staging task id, and null when nothing is pending", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:427 的分支（??：`r?.task_id ?? null`）取真的输入——
      //         有一条 input_refs 非空（staging 状态 pending）的 Queued run
      accept(store, task("t-214a", { input_refs: [{ source: "s3://a" }] }));
      accept(store, task("t-214b"));
      expect(store.inputStaging("t-214a").state).toBe("pending");

      // 步骤 2：调用 nextNeedingStaging(…) 并断言该侧可观测结果
      expect(store.nextNeedingStaging()).toBe("t-214a");

      // 步骤 3：构造使该分支取假的输入——把 staging 推进到非 pending（无显式 else：取假即跳过该块）
      store.setInputStaging("t-214a", { state: "ready", fetched: [], failed: [] });

      // 步骤 4：再次调用 nextNeedingStaging(…) 并断言取假侧结果（两侧都被观测到）
      //         ——没有候选行时 `r` 为 undefined，`r?.task_id` 得 undefined，`?? null` 归一成 null
      expect(store.nextNeedingStaging()).toBeNull();
      expect(store.nextNeedingStaging()).not.toBeUndefined();
    } finally {
      store.close();
    }
  });

});
