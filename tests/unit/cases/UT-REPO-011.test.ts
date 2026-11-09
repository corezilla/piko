/**
 * Case ID: UT-REPO-011  ·  STATUS: real
 *
 * 责任：被测符号 `generation`（REPO）在对象类型 `纯函数/无副作用` 下的维度格 `每等价类合法值`（该 Case 只登记本行 1 格）、`边界(上/下/零/空/满)`、`非法值`；只测该符号该类型
 * 维度坐标：`generation` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-011.md（脚本的唯一依据）
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

describe("UT-REPO-011 · generation · 纯函数/无副作用 × 每等价类合法值", () => {
  it("reports the generation of a run", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    // 步骤 2：调用 generation
    const generation = store.generation("t-1");

    // 步骤 3：断言返回值逐值对账——新建的任务纪元为 1
    expect(generation).toBe(1);
  } finally {
    store.close();
  }
  });

});
