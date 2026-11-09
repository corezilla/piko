/**
 * Case ID: UT-REPO-053  ·  STATUS: real
 *
 * 责任：参数 `fn: () => T` 的 `边界(上/下/零/空/满)` 类（store.ts:170）
 * 维度坐标：`tx` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-053.md（脚本的唯一依据）
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

describe("UT-REPO-053 · tx · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("commits a callback that changes nothing", async () => {
  const store = newStore();
  try {
    // 步骤 2：调用 tx（回调不改任何东西）
    const value = (store as unknown as { tx<T>(fn: () => T): T }).tx(() => undefined);

    // 步骤 3：断言返回值逐值对账
    expect(value).toBeUndefined();
  } finally {
    store.close();
  }
  });

});
