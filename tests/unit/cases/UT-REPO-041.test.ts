/**
 * Case ID: UT-REPO-041  ·  STATUS: real
 *
 * 责任：被测符号 `reserveTool`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`reserveTool` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-041.md（脚本的唯一依据）
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

describe("UT-REPO-041 · reserveTool · 状态分支 × 合法迁移", () => {
  it("reserves a tool call and counts it", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    // 步骤 2：调用 reserveTool
    const reserved = store.reserveTool("t-1", "op-1", "call-1", "read", "read_only", "safe");

    // 步骤 3：断言状态迁移合法——工具调用计数 +1
    expect(reserved).toBe("Admitted");
    expect(store.getRun("t-1").progress.tool_calls).toBe(1);
  } finally {
    store.close();
  }
  });

});
