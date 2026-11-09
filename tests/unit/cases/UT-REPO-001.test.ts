/**
 * Case ID: UT-REPO-001  ·  STATUS: real
 *
 * 责任：被测符号 `asReader`（REPO）在对象类型 `纯函数/无副作用` 下的维度格 `每等价类合法值`（该 Case 只登记本行 1 格）、`边界(上/下/零/空/满)`、`非法值`；只测该符号该类型
 * 维度坐标：`asReader` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-001.md（脚本的唯一依据）
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

describe("UT-REPO-001 · asReader · 纯函数/无副作用 × 每等价类合法值", () => {
  it("exposes the read-only view of the store", async () => {
  const store = newStore();
  try {
    // 步骤 2：调用 asReader
    const reader = asReader(store);

    // 步骤 3：断言返回值逐值对账——八个只读入口都在，且没有写入口
    expect(Object.keys(reader).sort()).toEqual([
      "cancelRequested",
      "discussionAccessLost",
      "generation",
      "getRun",
      "getTask",
      "knownActions",
      "pendingTurns",
      "rawUsage",
    ]);
  } finally {
    store.close();
  }
  });

});
