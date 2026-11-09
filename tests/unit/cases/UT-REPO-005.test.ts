/**
 * Case ID: UT-REPO-005  ·  STATUS: real
 *
 * 责任：被测符号 `discussionAccessLost`（REPO）在对象类型 `纯函数/无副作用` 下的维度格 `每等价类合法值`（该 Case 只登记本行 1 格）、`边界(上/下/零/空/满)`、`非法值`；只测该符号该类型
 * 维度坐标：`discussionAccessLost` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-005.md（脚本的唯一依据）
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

describe("UT-REPO-005 · discussionAccessLost · 纯函数/无副作用 × 每等价类合法值", () => {
  it("reports the discussion access loss for a task", async () => {
  const store = newStore();
  try {
    acceptDiscussion(store, "t-1");
    // 步骤 2：调用 markDiscussionAccessLost 与 discussionAccessLost
    const affected = store.markDiscussionAccessLost("!room:test");

    // 步骤 3：断言返回值逐值对账——受影响的任务被列出来，标记可读
    expect(affected).toEqual(["t-1"]);
    expect(store.discussionAccessLost("t-1")).toBe(true);
  } finally {
    store.close();
  }
  });

});
