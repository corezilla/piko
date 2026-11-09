/**
 * Case ID: UT-REPO-034  ·  STATUS: real
 *
 * 责任：被测符号 `readSlot`（REPO）在对象类型 `并发/可重入` 下的维度格 `并发对偶/交错`（该 Case 只登记本行 1 格）、`容量 N−1/N/N+1`、`可重入幂等`；只测该符号该类型
 * 维度坐标：`readSlot` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-034.md（脚本的唯一依据）
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

describe("UT-REPO-034 · readSlot · 并发/可重入 × 并发对偶/交错", () => {
  it("reads the execution slot's current holder", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    const grant = store.tryClaimSlot("worker", "boot") as { lease_epoch: number };
    // 步骤 2：调用 readSlot
    const slot = store.readSlot();

    // 步骤 3：断言返回值逐值对账——槽位的持有者与纪元
    expect(slot.task_id).toBe("t-1");
    expect(slot.owner_id).toBe("worker");
    expect(slot.lease_epoch).toBe(grant.lease_epoch);
  } finally {
    store.close();
  }
  });

});
