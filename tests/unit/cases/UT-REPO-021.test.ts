/**
 * Case ID: UT-REPO-021  ·  STATUS: real
 *
 * 责任：被测符号 `markTurn`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`markTurn` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-021.md（脚本的唯一依据）
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

describe("UT-REPO-021 · markTurn · 状态分支 × 合法迁移", () => {
  it("moves a discussion turn through its statuses", async () => {
  const store = newStore();
  try {
    acceptDiscussion(store, "t-1", "!room:test");
    // 步骤 2：调用 markTurn（Pending → QueuedInPi → Consumed）
    store.markTurn("t-1", "$e1", "QueuedInPi", "entry-1", "op-1");
    const queued = store.pendingTurns("t-1");
    store.markTurn("t-1", "$e1", "Consumed");

    // 步骤 3：断言状态迁移合法——Consumed 之后不再是待处理
    expect(queued).toHaveLength(1);
    expect(queued[0]?.pi_entry_id).toBe("entry-1");
    expect(store.pendingTurns("t-1")).toHaveLength(0);
  } finally {
    store.close();
  }
  });

});
