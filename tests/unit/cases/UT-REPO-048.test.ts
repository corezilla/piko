/**
 * Case ID: UT-REPO-048  ·  STATUS: real
 *
 * 责任：被测符号 `tryClaimSlot`（REPO）在对象类型 `并发/可重入` 下的维度格 `并发对偶/交错`（该 Case 只登记本行 1 格）、`容量 N−1/N/N+1`、`可重入幂等`；只测该符号该类型
 * 维度坐标：`tryClaimSlot` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-048.md（脚本的唯一依据）
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

describe("UT-REPO-048 · tryClaimSlot · 并发/可重入 × 并发对偶/交错", () => {
  it("gives the single slot to exactly one caller", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    accept(store, task("t-2"));
    // 步骤 2：调用 tryClaimSlot（连续两次）
    const first = store.tryClaimSlot("worker-1", "boot-1");
    const second = store.tryClaimSlot("worker-2", "boot-2");

    // 步骤 3：断言返回值逐值对账——槽位只有一个，第二个被拒
    expect(first).toMatchObject({ task_id: "t-1" });
    expect(second).toBe("slot_busy");
  } finally {
    store.close();
  }
  });

});
