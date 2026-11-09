/**
 * Case ID: UT-REPO-040  ·  STATUS: real
 *
 * 责任：被测符号 `reserveModel`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`reserveModel` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-040.md（脚本的唯一依据）
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

describe("UT-REPO-040 · reserveModel · 状态分支 × 合法迁移", () => {
  it("reserves a model attempt and counts it", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    // 步骤 2：调用 reserveModel
    const reserved = store.reserveModel("t-1", "op-1", "step-1", 1);

    // 步骤 3：断言状态迁移合法——模型调用计数 +1
    expect(reserved).toBe(true);
    expect(store.getRun("t-1").progress.model_calls).toBe(1);
  } finally {
    store.close();
  }
  });

});
