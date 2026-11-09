/**
 * Case ID: UT-REPO-008  ·  STATUS: real
 *
 * 责任：被测符号 `finish`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`finish` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-008.md（脚本的唯一依据）
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

describe("UT-REPO-008 · finish · 状态分支 × 合法迁移", () => {
  it("moves a running task to its terminal state", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    const grant = store.tryClaimSlot("worker", "boot") as { lease_epoch: number };
    // 步骤 2：调用 publishResult 与 finish
    const r = result("t-1");
    store.publishResult(r, grant.lease_epoch);
    store.finish(r, grant.lease_epoch);

    // 步骤 3：断言状态迁移合法——终态落库，槽位释放
    expect(store.getRun("t-1").state).toBe("Completed");
    expect(store.readSlot().task_id).toBeNull();
  } finally {
    store.close();
  }
  });

});
