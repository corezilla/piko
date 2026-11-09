/**
 * Case ID: UT-REPO-025  ·  STATUS: real
 *
 * 责任：被测符号 `nextNeedingStaging`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`nextNeedingStaging` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-025.md（脚本的唯一依据）
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

describe("UT-REPO-025 · nextNeedingStaging · 状态分支 × 合法迁移", () => {
  it("finds the oldest run whose inputs still need staging", async () => {
  const store = newStore();
  try {
    accept(store, task("t-pending", { input_refs: [{ source: "/remote/a" }] }));
    accept(store, task("t-none"));
    // 步骤 2：调用 nextNeedingStaging
    const next = store.nextNeedingStaging();

    // 步骤 3：断言返回值逐值对账——只有 staging 仍为 pending 的任务被选中
    expect(next).toBe("t-pending");
  } finally {
    store.close();
  }
  });

});
