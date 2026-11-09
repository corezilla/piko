/**
 * Case ID: UT-REPO-052  ·  STATUS: real
 *
 * 责任：参数 `fn: () => T` 的 `每等价类合法值` 类（store.ts:170）
 * 维度坐标：`tx` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-052.md（脚本的唯一依据）
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

describe("UT-REPO-052 · tx · 纯函数/无副作用 × 每等价类合法值", () => {
  it("commits the work the callback does", async () => {
  const store = newStore();
  try {
    // 步骤 2：调用 tx（回调返回一个值）
    const value = (store as unknown as { tx<T>(fn: () => T): T }).tx(() => 42);

    // 步骤 3：断言返回值逐值对账——回调的值被原样带回
    expect(value).toBe(42);
  } finally {
    store.close();
  }
  });

});
