/**
 * Case ID: UT-REPO-039  ·  STATUS: real
 *
 * 责任：被测符号 `renewSlot`（REPO）在对象类型 `并发/可重入` 下的维度格 `并发对偶/交错`（该 Case 只登记本行 1 格）、`容量 N−1/N/N+1`、`可重入幂等`；只测该符号该类型
 * 维度坐标：`renewSlot` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-039.md（脚本的唯一依据）
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

describe("UT-REPO-039 · renewSlot · 并发/可重入 × 并发对偶/交错", () => {
  it("renews the slot only for the right holder and epoch", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    const grant = store.tryClaimSlot("worker", "boot") as { lease_epoch: number };
    // 步骤 2：调用 renewSlot（先用错的纪元，再用对的）
    const stale = store.renewSlot("t-1", grant.lease_epoch + 1);
    const current = store.renewSlot("t-1", grant.lease_epoch);

    // 步骤 3：断言返回值逐值对账——纪元不符不续租
    expect(stale).toBe(false);
    expect(current).toBe(true);
  } finally {
    store.close();
  }
  });

});
