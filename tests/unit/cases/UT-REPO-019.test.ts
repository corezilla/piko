/**
 * Case ID: UT-REPO-019  ·  STATUS: real
 *
 * 责任：被测符号 `knownActions`（REPO）在对象类型 `持久化/序列化` 下的维度格 `round-trip`（该 Case 只登记本行 1 格）、`截断/损坏`、`版本不符`；只测该符号该类型
 * 维度坐标：`knownActions` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-019.md（脚本的唯一依据）
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

describe("UT-REPO-019 · knownActions · 持久化/序列化 × round-trip", () => {
  it("persists the model and tool ledgers the actions read", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    // 步骤 2：调用 reserveModel、terminalModel、reserveTool、terminalTool
    store.reserveModel("t-1", "op-1", "step-1", 1);
    store.terminalModel("t-1", "op-1", "step-1", 1);
    store.reserveTool("t-1", "op-1", "call-1", "read", "read_only", "safe");
    store.terminalTool("t-1", "op-1", "call-1");

    // 步骤 3：断言落库——两类账本都进了动作列表
    const actions = store.knownActions("t-1");
    expect(actions.filter((a) => a.kind === "ModelCall")).toHaveLength(1);
    expect(actions.filter((a) => a.kind === "ToolCall")).toHaveLength(1);
    expect(actions.every((a) => a.status === "Completed")).toBe(true);
  } finally {
    store.close();
  }
  });

});
