/**
 * Case ID: UT-REPO-010  ·  STATUS: real
 *
 * 责任：被测符号 `finishQueued`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`finishQueued` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-010.md（脚本的唯一依据）
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

describe("UT-REPO-010 · finishQueued · 状态分支 × 合法迁移", () => {
  it("finalises a queued task that never took the slot", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    // 步骤 2：调用 finishQueued
    store.finishQueued(result("t-1", { state: "Failed", failure: { code: "InputFetchFailed", cause_class: "Dependency", message: "nope" } }));

    // 步骤 3：断言状态迁移合法——Queued 直接转终态
    expect(store.getRun("t-1").state).toBe("Failed");
    expect(store.result("t-1").failure?.code).toBe("InputFetchFailed");
  } finally {
    store.close();
  }
  });

});
