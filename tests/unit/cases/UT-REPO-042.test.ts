/**
 * Case ID: UT-REPO-042  ·  STATUS: real
 *
 * 责任：被测符号 `scanNonTerminal`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`scanNonTerminal` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-042.md（脚本的唯一依据）
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

describe("UT-REPO-042 · scanNonTerminal · 状态分支 × 合法迁移", () => {
  it("lists the runs that have not reached a terminal state", async () => {
  const store = newStore();
  try {
    accept(store, task("t-queued"));
    accept(store, task("t-done"));
    store.finishQueued(result("t-done"));
    // 步骤 2：调用 scanNonTerminal
    const ids = store.scanNonTerminal();

    // 步骤 3：断言返回值逐值对账——终态的不在列
    expect(ids).toEqual(["t-queued"]);
  } finally {
    store.close();
  }
  });

});
