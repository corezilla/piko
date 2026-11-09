/**
 * Case ID: UT-REPO-035  ·  STATUS: real
 *
 * 责任：被测符号 `recordMatrixEvent`（REPO）在对象类型 `持久化/序列化` 下的维度格 `round-trip`（该 Case 只登记本行 1 格）、`截断/损坏`、`版本不符`；只测该符号该类型
 * 维度坐标：`recordMatrixEvent` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-035.md（脚本的唯一依据）
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

describe("UT-REPO-035 · recordMatrixEvent · 持久化/序列化 × round-trip", () => {
  it("persists a matrix event once", async () => {
  const store = newStore();
  try {
    // 步骤 2：调用 recordMatrixEvent（同一事件两次）
    const first = store.recordMatrixEvent("!room:test", "$e1", "@u:piko.local", "txn-1");
    const second = store.recordMatrixEvent("!room:test", "$e1", "@u:piko.local", "txn-1");

    // 步骤 3：断言落库——第一次插入，第二次被唯一性挡下
    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(store.hasMatrixEvent("!room:test", "$e1")).toBe(true);
  } finally {
    store.close();
  }
  });

});
