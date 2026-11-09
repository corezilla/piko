/**
 * Case ID: UT-REPO-024  ·  STATUS: real
 *
 * 责任：被测符号 `mutateRun`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`mutateRun` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-024.md（脚本的唯一依据）
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

describe("UT-REPO-024 · mutateRun · 状态分支 × 合法迁移", () => {
  it("moves a run's generation forward under a fence", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    // 步骤 2：调用 mutateRun（纪元对上，状态对上）
    const generation = store.mutateRun({
      task_id: "t-1",
      expected_generation: 1,
      expected_state_in: ["Queued"],
      mutation: (r) => {
        r.state = "Running";
      },
    });

    // 步骤 3：断言状态迁移合法——纪元 +1，状态照写
    expect(generation).toBe(2);
    expect(store.getRun("t-1").state).toBe("Running");
    expect(store.getRun("t-1").generation).toBe(2);
  } finally {
    store.close();
  }
  });

});
