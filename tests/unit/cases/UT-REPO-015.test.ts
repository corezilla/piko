/**
 * Case ID: UT-REPO-015  ·  STATUS: real
 *
 * 责任：被测符号 `ingestMatrixBatch`（REPO）在对象类型 `持久化/序列化` 下的维度格 `round-trip`（该 Case 只登记本行 1 格）、`截断/损坏`、`版本不符`；只测该符号该类型
 * 维度坐标：`ingestMatrixBatch` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-015.md（脚本的唯一依据）
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

describe("UT-REPO-015 · ingestMatrixBatch · 持久化/序列化 × round-trip", () => {
  it("persists a batch of matrix events and the cursor", async () => {
  const store = newStore();
  try {
    acceptDiscussion(store, "t-1", "!room:test");
    // 步骤 2：调用 ingestMatrixBatch
    const count = store.ingestMatrixBatch(
      [{ room: "!room:test", event: "$e1", sender: "@u:piko.local", turns: [{ task: "t-1", visible: "hello" }] }],
      "cursor-1",
    );

    // 步骤 3：断言落库——游标、事件与讨论轮次都在
    expect(count).toBe(1);
    expect(store.matrixCursor()).toBe("cursor-1");
    expect(store.hasMatrixEvent("!room:test", "$e1")).toBe(true);
    expect(store.pendingTurns("t-1")).toHaveLength(1);
  } finally {
    store.close();
  }
  });

});
