/**
 * Case ID: UT-REPO-014  ·  STATUS: real
 *
 * 责任：被测符号 `hasMatrixEvent`（REPO）在对象类型 `纯函数/无副作用` 下的维度格 `每等价类合法值`（该 Case 只登记本行 1 格）、`边界(上/下/零/空/满)`、`非法值`；只测该符号该类型
 * 维度坐标：`hasMatrixEvent` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-014.md（脚本的唯一依据）
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

describe("UT-REPO-014 · hasMatrixEvent · 纯函数/无副作用 × 每等价类合法值", () => {
  it("reports whether a matrix event was seen", async () => {
  const store = newStore();
  try {
    // 步骤 2：调用 recordMatrixEvent 与 hasMatrixEvent
    const recorded = store.recordMatrixEvent("!room:test", "$e1", "@u:piko.local");
    const seen = store.hasMatrixEvent("!room:test", "$e1");

    // 步骤 3：断言返回值逐值对账——记下即查得到
    expect(recorded).toBe(true);
    expect(seen).toBe(true);
    expect(store.hasMatrixEvent("!room:test", "$other")).toBe(false);
  } finally {
    store.close();
  }
  });

});
