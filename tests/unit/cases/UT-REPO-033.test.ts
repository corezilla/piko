/**
 * Case ID: UT-REPO-033  ·  STATUS: real
 *
 * 责任：被测符号 `rawUsage`（REPO）在对象类型 `持久化/序列化` 下的维度格 `round-trip`（该 Case 只登记本行 1 格）、`截断/损坏`、`版本不符`；只测该符号该类型
 * 维度坐标：`rawUsage` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-033.md（脚本的唯一依据）
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

describe("UT-REPO-033 · rawUsage · 持久化/序列化 × round-trip", () => {
  it("persists and reads back the raw model usage", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    store.reserveModel("t-1", "op-1", "step-1", 1);
    store.observeUsage("t-1", "op-1", "step-1", 1, rawUsageSample());
    // 步骤 2：调用 rawUsage
    const raw = store.rawUsage("t-1");

    // 步骤 3：断言落库——逐值对账
    expect(raw).toHaveLength(1);
    expect(raw[0]).toMatchObject({ input: 10, output: 5, totalTokens: 15 });
  } finally {
    store.close();
  }
  });

});
