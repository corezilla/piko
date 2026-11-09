/**
 * Case ID: UT-REPO-037  ·  STATUS: real
 *
 * 责任：被测符号 `recoverOrphaned`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`recoverOrphaned` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-037.md（脚本的唯一依据）
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

describe("UT-REPO-037 · recoverOrphaned · 状态分支 × 合法迁移", () => {
  it("reclaims an orphaned run for a new boot", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    const grant = store.tryClaimSlot("worker", "boot") as { lease_epoch: number };
    // 步骤 2：调用 recoverOrphaned（新的 owner 与 boot）
    const reclaimed = store.recoverOrphaned("worker-2", "boot-2");

    // 步骤 3：断言状态迁移合法——同一个任务，纪元 +1
    expect(reclaimed).toEqual({ task_id: "t-1", lease_epoch: grant.lease_epoch + 1 });
    expect(store.readSlot().owner_id).toBe("worker-2");
  } finally {
    store.close();
  }
  });

});
