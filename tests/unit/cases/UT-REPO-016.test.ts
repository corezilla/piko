/**
 * Case ID: UT-REPO-016  ·  STATUS: real
 *
 * 责任：被测符号 `ingestMatrixEvent`（REPO）在对象类型 `持久化/序列化` 下的维度格 `round-trip`（该 Case 只登记本行 1 格）、`截断/损坏`、`版本不符`；只测该符号该类型
 * 维度坐标：`ingestMatrixEvent` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-016.md（脚本的唯一依据）
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

describe("UT-REPO-016 · ingestMatrixEvent · 持久化/序列化 × round-trip", () => {
  it("persists a matrix event and its discussion turn", async () => {
  const store = newStore();
  try {
    acceptDiscussion(store, "t-1", "!room:test");
    // 步骤 2：调用 ingestMatrixEvent
    const ingested = store.ingestMatrixEvent(
      "!room:test",
      "$e1",
      "@u:piko.local",
      undefined,
      [{ task: "t-1", visible: "hello" }],
    );

    // 步骤 3：断言落库——事件记下了，轮次也排上了
    expect(ingested).toBe(true);
    expect(store.hasMatrixEvent("!room:test", "$e1")).toBe(true);
    expect(store.pendingTurns("t-1")).toHaveLength(1);
  } finally {
    store.close();
  }
  });

});
