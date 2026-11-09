/**
 * Case ID: UT-REPO-060  ·  STATUS: real
 *
 * 责任：返回站点 L175 值 `x` 逐值断言（store.ts）
 * 维度坐标：`tx` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-060.md（脚本的唯一依据）
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

describe("UT-REPO-060 · tx · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the callback's value", async () => {
  const store = newStore();
  try {
    // 步骤 2：调用 tx
    // 步骤 3：断言返回值逐值对账
    const value = (store as unknown as { tx<T>(fn: () => T): T }).tx(() => "the value");
    expect(value).toBe("the value");
  } finally {
    store.close();
  }
  });

});
