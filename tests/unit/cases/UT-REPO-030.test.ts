/**
 * Case ID: UT-REPO-030  ·  STATUS: real
 *
 * 责任：被测符号 `publishResult`（REPO）在对象类型 `持久化/序列化` 下的维度格 `round-trip`（该 Case 只登记本行 1 格）、`截断/损坏`、`版本不符`；只测该符号该类型
 * 维度坐标：`publishResult` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-030.md（脚本的唯一依据）
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

describe("UT-REPO-030 · publishResult · 持久化/序列化 × round-trip", () => {
  it("persists the published result before the terminal state", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    const grant = store.tryClaimSlot("worker", "boot") as { lease_epoch: number };
    // 步骤 2：调用 publishResult
    store.publishResult(result("t-1"), grant.lease_epoch);

    // 步骤 3：断言落库——结果已可读，但运行还没终态
    expect(store.result("t-1").state).toBe("Completed");
    expect(store.getRun("t-1").state).toBe("Running");
  } finally {
    store.close();
  }
  });

});
