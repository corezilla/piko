/**
 * Case ID: UT-REPO-031  ·  STATUS: real
 *
 * 责任：被测符号 `purge`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`purge` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-031.md（脚本的唯一依据）
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

describe("UT-REPO-031 · purge · 状态分支 × 合法迁移", () => {
  it("tombstones the tasks it purges", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    store.finishQueued(result("t-1"));
    // 步骤 2：调用 purge（点名那一条）
    const outcome = store.purge({ task_id: "t-1" });

    // 步骤 3：断言状态迁移合法——任务被清成墓碑
    expect(outcome).toEqual({ removed: 1, tombstones: 1 });
    expect(() => store.getTask("t-1")).toThrow(/task not found/);
  } finally {
    store.close();
  }
  });

});
