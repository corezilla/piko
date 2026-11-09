/**
 * Case ID: UT-REPO-047  ·  STATUS: real
 *
 * 责任：被测符号 `terminalTool`（REPO）在对象类型 `纯函数/无副作用` 下的维度格 `每等价类合法值`（该 Case 只登记本行 1 格）、`边界(上/下/零/空/满)`、`非法值`；只测该符号该类型
 * 维度坐标：`terminalTool` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-047.md（脚本的唯一依据）
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

describe("UT-REPO-047 · terminalTool · 纯函数/无副作用 × 每等价类合法值", () => {
  it("marks a tool call terminal", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    store.reserveTool("t-1", "op-1", "call-1", "read", "read_only", "safe");
    // 步骤 2：调用 terminalTool
    store.terminalTool("t-1", "op-1", "call-1");

    // 步骤 3：断言返回值逐值对账——动作列表里的状态是 Completed
    const actions = store.knownActions("t-1");
    expect(actions.find((a) => a.kind === "ToolCall")?.status).toBe("Completed");
  } finally {
    store.close();
  }
  });

});
