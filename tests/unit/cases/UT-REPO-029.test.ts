/**
 * Case ID: UT-REPO-029  ·  STATUS: real
 *
 * 责任：被测符号 `prepareMatrixSend`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`prepareMatrixSend` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-029.md（脚本的唯一依据）
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

describe("UT-REPO-029 · prepareMatrixSend · 状态分支 × 合法迁移", () => {
  it("moves a matrix send from absent to pending", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    // 步骤 2：调用 prepareMatrixSend
    const send = store.prepareMatrixSend("txn-1", "t-1", 1, "sha-1");

    // 步骤 3：断言状态迁移合法——先记为 Pending
    expect(send).toEqual({ state: "Pending" });
  } finally {
    store.close();
  }
  });

});
