/**
 * Case ID: UT-REPO-049  ·  STATUS: real
 *
 * 责任：被测符号 `tryCloseIntake`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`tryCloseIntake` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-049.md（脚本的唯一依据）
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

describe("UT-REPO-049 · tryCloseIntake · 状态分支 × 合法迁移", () => {
  it("moves a discussion intake from open to closing", async () => {
  const store = newStore();
  try {
    acceptDiscussion(store, "t-1", "!room:test");
    const grant = store.tryClaimSlot("worker", "boot") as { lease_epoch: number };
    // 把触发轮次消费掉——有待处理轮次时不允许关闭
    store.markTurn("t-1", "$e1", "Consumed");
    // 步骤 2：调用 tryCloseIntake
    const closed = store.tryCloseIntake("t-1", grant.lease_epoch);

    // 步骤 3：断言状态迁移合法——Open 变 Closing
    expect(closed).toBe(true);
    expect(store.getRun("t-1").discussion_intake_state).toBe("Closing");
  } finally {
    store.close();
  }
  });

});
