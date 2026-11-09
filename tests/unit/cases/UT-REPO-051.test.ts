/**
 * Case ID: UT-REPO-051  ·  STATUS: real
 *
 * 责任：被测符号 `usageSoFar`（REPO）在对象类型 `持久化/序列化` 下的维度格 `round-trip`（该 Case 只登记本行 1 格）、`截断/损坏`、`版本不符`；只测该符号该类型
 * 维度坐标：`usageSoFar` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-051.md（脚本的唯一依据）
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

describe("UT-REPO-051 · usageSoFar · 持久化/序列化 × round-trip", () => {
  it("persists the model usage the summary reads back", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    store.reserveModel("t-1", "op-1", "step-1", 1);
    store.observeUsage("t-1", "op-1", "step-1", 1, rawUsageSample());
    // 步骤 2：调用 getRun（它内部读 usageSoFar）
    const view = store.getRun("t-1");

    // 步骤 3：断言落库——用量汇总逐值对账
    expect(view.progress.usage_so_far).toEqual({ input_tokens: 10, output_tokens: 5, total_tokens: 15 });
  } finally {
    store.close();
  }
  });

});
