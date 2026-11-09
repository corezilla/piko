/**
 * Case ID: UT-REPO-004  ·  STATUS: real
 *
 * 责任：被测符号 `createOrGet`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`createOrGet` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-004.md（脚本的唯一依据）
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

describe("UT-REPO-004 · createOrGet · 状态分支 × 合法迁移", () => {
  it("moves a new task from absent to queued", async () => {
  const store = newStore();
  try {
    // 步骤 2：调用 createOrGet（一条新任务）
    const outcome = store.createOrGet(task("t-1"), "slinky", 10);

    // 步骤 3：断言状态迁移合法——建成即 Queued，纪元为 1
    expect(outcome).toEqual({ kind: "created", task_id: "t-1", generation: 1, state: "Queued" });
    expect(store.getRun("t-1").state).toBe("Queued");
  } finally {
    store.close();
  }
  });

});
