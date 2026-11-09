/**
 * Case ID: UT-REPO-045  ·  STATUS: real
 *
 * 责任：被测符号 `setMatrixCursor`（REPO）在对象类型 `持久化/序列化` 下的维度格 `round-trip`（该 Case 只登记本行 1 格）、`截断/损坏`、`版本不符`；只测该符号该类型
 * 维度坐标：`setMatrixCursor` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-045.md（脚本的唯一依据）
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

describe("UT-REPO-045 · setMatrixCursor · 持久化/序列化 × round-trip", () => {
  it("persists the matrix sync cursor", async () => {
  const store = newStore();
  try {
    // 步骤 2：调用 setMatrixCursor
    store.setMatrixCursor("cursor-9");

    // 步骤 3：断言落库——游标逐值对账
    expect(store.matrixCursor()).toBe("cursor-9");
  } finally {
    store.close();
  }
  });

});
